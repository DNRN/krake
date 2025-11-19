import { Member } from "./members";
import { generateRandomGroupName } from "./random-names";


export const WorkingGroups = async(members: Member[], weeks: number[], count: number) => {
    // First order members by score
    // const orderedMembers = members.sort((a, b) => b.score - a.score);
    const score1 = members.filter(m => m.score === 1).sort(() => Math.random() - 0.5);
    const score1Count = Math.floor(score1.length / count);
    const score2 = members.filter(m => m.score === 2).sort(() => Math.random() - 0.5);
    const score2Count = Math.floor(score2.length / count);
    const score3 = members.filter(m => m.score === 3).sort(() => Math.random() - 0.5);
    const score3Count = Math.floor(score3.length / count);

    // Then split into working groups
    const workingGroups: WorkingGroup[] = [];
    const usedNames = new Set<string>();

    const weeksMod = weeks.length / count;
    
    for (let i = 0; i < count; i++) {
        let name = generateRandomGroupName();
        // Ensure unique names (with a safety limit to avoid infinite loops)
        let attempts = 0;
        while (usedNames.has(name) && attempts < 50) {
            name = generateRandomGroupName();
            attempts++;
        }
        usedNames.add(name);

        // Add weeks
        workingGroups.push({
            id: `${i}`,
            name: name,
            members: [],
            weeks: weeks.filter((_, index) => index % count === i)
        });
    }

    // Add members to working groups
    let wgIndex = 0;
    score1.forEach(member => {
        if (wgIndex >= workingGroups.length) {
            wgIndex = 0;
        }
        const workingGroup = nextWgWithLowestScoreAvailable(workingGroups, member, wgIndex);
        if (workingGroup) {
            workingGroup.members.push(member);
        }
        wgIndex++;
    });

    wgIndex = 0;
    score2.forEach(member => {
        if (wgIndex >= workingGroups.length) {
            wgIndex = 0;
        }
        const workingGroup = nextWgWithLowestScoreAvailable(workingGroups, member, wgIndex);
        if (workingGroup) {
            workingGroup.members.push(member);
        }
        wgIndex++;
    });

    wgIndex = 0;
    score3.forEach(member => {
        if (wgIndex >= workingGroups.length) {
            wgIndex = 0;
        }
        const workingGroup = nextWgWithLowestScoreAvailable(workingGroups, member, wgIndex);
        if (workingGroup) {
            workingGroup.members.push(member);
        }
        wgIndex++;
    });
    return workingGroups;
}



const nextFreeWorkingGroup = (workingGroups: WorkingGroup[], member: Member, index: number) => {
    if (index >= workingGroups.length) {
        return 0;
    }
    if (canAddToWorkingGroup(member, workingGroups[index])) {
        return workingGroups[index];
    }
    return nextFreeWorkingGroup(workingGroups, member, index + 1);
}

/**
 * Counts how many members in a working group have a specific score
 */
const countMembersWithScore = (workingGroup: WorkingGroup, score: number): number => {
    return workingGroup.members.filter(m => m.score === score).length;
};

/**
 * Sorts working groups by how many members they have with a specific score
 * Returns a new array sorted ascending (fewest members with score first)
 */
export const sortWorkingGroupsByScoreCount = (workingGroups: WorkingGroup[], score: number): WorkingGroup[] => {
    return [...workingGroups].sort((a, b) => {
        const countA = countMembersWithScore(a, score);
        const countB = countMembersWithScore(b, score);
        return countA - countB;
    });
};

/**
 * Finds the working group with the fewest members of the same score as the given member
 * that can accept the member, starting from the given index
 */
const nextWgWithLowestScoreAvailable = (workingGroups: WorkingGroup[], member: Member, index: number): WorkingGroup | null => {
    // Filter to only working groups that can accept this member
    // const availableGroups = workingGroups.filter(wg => canAddToWorkingGroup(member, wg));
    
    // if (availableGroups.length === 0) {
    //     return null;
    // }
    
    // Sort by count of members with the same score (ascending - fewest first)
    const sortedGroups = sortWorkingGroupsByScoreCount(workingGroups.filter(wg => canAddToWorkingGroup(member, wg)), member.score);
    
    // Return the first one (fewest members with this score)
    return sortedGroups[0];
}

const canAddToWorkingGroup = (member: Member, workingGroup: WorkingGroup) => {
    if (workingGroup.members.find(m => m.household === member.household)) {
        return false;
    }
    if (workingGroup.members.find(m => m.weeks.some(week => member.weeks.includes(week)))) {
        return false;
    }
    // Allow max one member with weight < 1 per working group
    if (member.weight < 1 && workingGroup.members.some(m => m.weight < 1)) {
        return false;
    }
    return true;
}

const findRandomMemberWithScore = (score: number, workingGroup: WorkingGroup) => {
    const members = workingGroup.members.filter(m => m.score === score);
    return members[Math.floor(Math.random() * members.length)];
}


export type WorkingGroup = {
    id: string;
    name: string;
    members: Member[];
    weeks: number[];
}