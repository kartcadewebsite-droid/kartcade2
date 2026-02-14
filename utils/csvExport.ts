import { CustomerAnalytics } from '../services/crm';

/**
 * Converts a list of customers into a CSV string and downloads it
 */
export const exportCustomersToCSV = (customers: CustomerAnalytics[]) => {
    // 1. Define Headers
    const headers = [
        'Name',
        'Email',
        'Phone',
        'Total Spend ($)',
        'Visit Count',
        'Last Visit',
        'Favorite Equipment',
        'Membership Tier',
        'Registered Date'
    ];

    // 2. Format Data Rows
    const rows = customers.map(c => [
        `"${c.name}"`,              // Wrap in quotes to handle commas in names
        `"${c.email}"`,
        `"${c.phone || ''}"`,
        c.totalSpend.toFixed(2),
        c.visitCount,
        c.lastVisit || 'Never',
        c.favoriteEquipment || 'None',
        c.membershipTier || 'None',
        c.registrationDate?.toDate ? c.registrationDate.toDate().toLocaleDateString() : 'Unknown'
    ]);

    // 3. Combine with newlines
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    // 4. Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kartcade_customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
