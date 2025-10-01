import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import { logger } from './logger';
import Student from '../models/Student';
import Event from '../models/Event';

export interface AttendanceRecord {
  rollNo: string;
}

export interface ExcelUploadResult {
  success: boolean;
  message: string;
  data?: {
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    errors: string[];
    processedStudentIds?: string[];
  };
}

export const processAttendanceExcel = async (
  fileBuffer: Buffer,
  eventId: string
): Promise<ExcelUploadResult> => {
  try {
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return {
        success: false,
        message: 'Excel file is empty or has no valid data'
      };
    }

    // Validate required columns - only rollNo is required
    const requiredColumns = ['rollNo'];
    const firstRow = jsonData[0] as any;
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingColumns.join(', ')}`
      };
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return {
        success: false,
        message: 'Event not found'
      };
    }

    const results = {
      totalRecords: jsonData.length,
      processedRecords: 0,
      failedRecords: 0,
      errors: [] as string[],
      processedStudentIds: [] as string[]
    };

    // Process each record
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // Excel rows start from 1, and we have header

      try {
        // Validate roll number
        if (!row.rollNo) {
          results.failedRecords++;
          results.errors.push(`Row ${rowNumber}: Missing roll number`);
          continue;
        }

        // Validate roll number format
        const rollNoRegex = /^[A-Z]{2}\d{2}[A-Z]\d{4}$/;
        if (!rollNoRegex.test(row.rollNo.toUpperCase())) {
          results.failedRecords++;
          results.errors.push(`Row ${rowNumber}: Invalid roll number format - ${row.rollNo}`);
          continue;
        }

        // Use event's given hours (no bonus hours from Excel)
        const hours = event.givenHours;

        // Find student
        const student = await Student.findOne({ 
          rollNo: row.rollNo.toUpperCase(),
          approved: true,
          isActive: true
        });

        if (!student) {
          results.failedRecords++;
          results.errors.push(`Row ${rowNumber}: Student not found or not approved - ${row.rollNo}`);
          continue;
        }

        // Add event to student with event hours only
        student.addEvent(event._id as mongoose.Types.ObjectId, hours);
        await student.save();

        // Add student to event's attendees list if not already present
        if (!event.attendees.includes(student._id as mongoose.Types.ObjectId)) {
          event.attendees.push(student._id as mongoose.Types.ObjectId);
          await event.save();
        }

        // collect processed student id for notifications
        results.processedStudentIds.push((student._id as any).toString());

        results.processedRecords++;

      } catch (error) {
        results.failedRecords++;
        results.errors.push(`Row ${rowNumber}: Processing error - ${error}`);
        logger.error(`Error processing row ${rowNumber}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully processed ${results.processedRecords} out of ${results.totalRecords} records`,
      data: results
    };

  } catch (error) {
    logger.error('Error processing Excel file:', error);
    return {
      success: false,
      message: 'Error processing Excel file'
    };
  }
};

export const generateAttendanceTemplate = (): Buffer => {
  // Create sample data with only roll numbers
  const sampleData = [
    {
      rollNo: 'CS23B1001'
    },
    {
      rollNo: 'CS23B1002'
    }
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Add to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};