import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const SPREADSHEET_ID = '1Y8_gNQQwmTXVtQzqygebHEGi-lvSiz4w5L0M3XiI924';

interface GoogleSheetsConfig {
  credentials?: string | object; // Path to credentials file or credentials object
  email?: string; // Service account email (if using service account)
}

class GoogleSheetsClient {
  private auth: JWT | null = null;
  private sheets: ReturnType<typeof google.sheets> | null = null;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig = {}) {
    this.config = config;
  }

  /**
   * Find credentials file in project root
   */
  private findCredentialsFile(): string | null {
    const projectRoot = process.cwd();
    const possibleNames = [
      'credentials.json',
      'service-account.json',
      'google-credentials.json',
      'entropy-fox-174dda76e9e8.json', // Your specific file
    ];

    // Also check for any .json files that might be credentials
    try {
      const files = fs.readdirSync(projectRoot);
      for (const file of files) {
        if (
          file.endsWith('.json') &&
          !file.includes('package') &&
          !file.includes('tsconfig') &&
          !file.includes('node_modules')
        ) {
          const filePath = path.join(projectRoot, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(content);
            if (parsed.type === 'service_account' && parsed.private_key) {
              return filePath;
            }
          } catch {
            // Not a valid JSON or not a service account file
            continue;
          }
        }
      }
    } catch {
      // Directory read failed
    }

    return null;
  }

  /**
   * Initialize the Google Sheets client with authentication
   */
  async initialize(): Promise<void> {
    try {
      // Try to get credentials from environment variable or config
      let credentials =
        this.config.credentials ||
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS;

      // If no credentials found, try to find a credentials file
      if (!credentials) {
        const credsFile = this.findCredentialsFile();
        if (credsFile) {
          credentials = credsFile;
        }
      }

      if (typeof credentials === 'string') {
        // If it's a JSON string, parse it
        try {
          const creds = JSON.parse(credentials);
          this.auth = new JWT({
            email: creds.client_email || this.config.email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });
        } catch {
          // If parsing fails, treat it as a file path
          // Check if file exists
          if (fs.existsSync(credentials)) {
            this.auth = new JWT({
              keyFile: credentials,
              scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
          } else {
            throw new Error(
              `Credentials file not found: ${credentials}. Please provide a valid path to your service account JSON file, or set GOOGLE_APPLICATION_CREDENTIALS environment variable.`
            );
          }
        }
      } else if (typeof credentials === 'object') {
        // Direct credentials object
        this.auth = new JWT({
          email: (credentials as any).client_email || this.config.email,
          key: (credentials as any).private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else {
        throw new Error(
          'No authentication credentials provided. Please provide credentials via:\n' +
            '1. Config: new GoogleSheetsClient({ credentials: "path/to/file.json" })\n' +
            '2. Environment variable: GOOGLE_APPLICATION_CREDENTIALS\n' +
            '3. Place a service account JSON file in the project root'
        );
      }

      if (this.auth) {
        await this.auth.authorize();
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      } else {
        throw new Error('No authentication credentials provided');
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize Google Sheets client: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Read data from a range in the spreadsheet
   * @param range - A1 notation range (e.g., 'Sheet1!A1:D10' or 'A1:D10')
   * @param spreadsheetId - Optional spreadsheet ID (defaults to the configured one)
   */
  async read(
    range: string,
    spreadsheetId: string = SPREADSHEET_ID
  ): Promise<string[][]> {
    if (!this.sheets) {
      await this.initialize();
    }

    try {
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      throw new Error(
        `Failed to read from Google Sheets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Write data to a range in the spreadsheet
   * @param range - A1 notation range (e.g., 'Sheet1!A1:D10' or 'A1:D10')
   * @param values - 2D array of values to write
   * @param spreadsheetId - Optional spreadsheet ID (defaults to the configured one)
   */
  async write(
    range: string,
    values: (string | number | boolean)[][],
    spreadsheetId: string = SPREADSHEET_ID
  ): Promise<void> {
    if (!this.sheets) {
      await this.initialize();
    }

    try {
      await this.sheets!.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to write to Google Sheets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Append data to the end of a range in the spreadsheet
   * @param range - A1 notation range (e.g., 'Sheet1!A1:D' or 'A1:D')
   * @param values - 2D array of values to append
   * @param spreadsheetId - Optional spreadsheet ID (defaults to the configured one)
   */
  async append(
    range: string,
    values: (string | number | boolean)[][],
    spreadsheetId: string = SPREADSHEET_ID
  ): Promise<void> {
    if (!this.sheets) {
      await this.initialize();
    }

    try {
      await this.sheets!.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to append to Google Sheets: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear a range in the spreadsheet
   * @param range - A1 notation range (e.g., 'Sheet1!A1:D10' or 'A1:D10')
   * @param spreadsheetId - Optional spreadsheet ID (defaults to the configured one)
   */
  async clear(
    range: string,
    spreadsheetId: string = SPREADSHEET_ID
  ): Promise<void> {
    if (!this.sheets) {
      await this.initialize();
    }

    try {
      await this.sheets!.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });
    } catch (error) {
      throw new Error(
        `Failed to clear Google Sheets range: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get spreadsheet metadata
   * @param spreadsheetId - Optional spreadsheet ID (defaults to the configured one)
   */
  async getMetadata(spreadsheetId: string = SPREADSHEET_ID) {
    if (!this.sheets) {
      await this.initialize();
    }

    try {
      const response = await this.sheets!.spreadsheets.get({
        spreadsheetId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get spreadsheet metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Export a singleton instance and the class
export const Google = new GoogleSheetsClient();
export { GoogleSheetsClient, SPREADSHEET_ID };