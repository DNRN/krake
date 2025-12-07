import express, { Request, Response } from 'express';
import { GoogleSheetsClient } from './google';
import { Members } from './members';
import { WorkingGroups } from './working-groups';

const app = express();
const PORT = process.env.PORT || 3000;

const weeks = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
const numberOfWorkingGroups = 6;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Krake API' });
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/grupper', async (req: Request, res: Response) => {
    let save = true;
    try {
        const google = new GoogleSheetsClient();
        await google.initialize();
        const members = await Members(google);
        const workingGroups = await WorkingGroups(members.filter(m => m.weight > 0), weeks, numberOfWorkingGroups);

        if (save) {
            await google.write('Grupper!A2:D10', workingGroups.map(wg => [wg.id, wg.name, wg.members.map(m => `${m.name}-${m.household}`).join(','), wg.weeks.join(',')]));
        }

        res.json({
            workingGroups,
            members,
        });
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
