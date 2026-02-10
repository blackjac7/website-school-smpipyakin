# Script: Adjust Student Entry Years

## Purpose

This script adjusts all student entry years (tahun masuk/angkatan) by moving them back by 1 year. This is useful when students were initially entered with incorrect year data.

## Example

- Students with year 2026 → will become 2025
- Students with year 2025 → will become 2024
- Students with year 2024 → will become 2023

## Usage

### Run the Script

```bash
npx ts-node scripts/adjust-student-years.ts
```

### What the Script Does

1. Fetches all students with year data from the database
2. Shows the current year distribution
3. Updates all student years by subtracting 1
4. Shows the new year distribution after adjustment
5. Confirms the number of records updated

### Sample Output

```
🔄 Starting student year adjustment...

📊 Found 150 students with year data

📋 Current Year Distribution:
   2026: 50 students
   2025: 60 students
   2024: 40 students

🔄 Adjusting years (moving back 1 year)...

✅ Updated 150 student records

📋 New Year Distribution:
   2025: 50 students
   2024: 60 students
   2023: 40 students

✅ Year adjustment completed successfully!

💡 Tip: If you need to revert, run this script again but change 'decrement' to 'increment'

🎉 Script completed!
```

## Reverting Changes

If you need to undo the adjustment (move years forward by 1), edit the script and change:

```typescript
// From:
year: {
  decrement: 1,
}

// To:
year: {
  increment: 1,
}
```

## Safety Features

- Only updates students that have a year value (ignores null years)
- Uses Prisma's `updateMany` for atomic database operation
- Shows before and after statistics
- Provides clear confirmation messages

## Database Impact

- **Table Affected**: `siswa`
- **Field Updated**: `year`
- **Operation**: Decrements by 1
- **Condition**: Only students with non-null year values

## Notes

- Always backup your database before running mass updates
- The script automatically disconnects from the database when complete
- Check the year distribution carefully before and after running
