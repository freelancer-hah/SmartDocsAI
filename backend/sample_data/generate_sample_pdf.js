const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const sampleDir = path.join(__dirname);
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

const outputPath = path.join(sampleDir, 'Acme_Global_Employee_Handbook_2026.pdf');
const doc = new PDFDocument({ margin: 50, size: 'A4' });
const writeStream = fs.createWriteStream(outputPath);

doc.pipe(writeStream);

// Helper for styling
function addTitle(text) {
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b').text(text, { align: 'center' });
  doc.moveDown(0.5);
}

function addSubtitle(text) {
  doc.fontSize(12).font('Helvetica-Oblique').fillColor('#64748b').text(text, { align: 'center' });
  doc.moveDown(1.5);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);
}

function addSectionHeader(sectionNum, title) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0284c7').text(`Section ${sectionNum}: ${title}`);
  doc.moveDown(0.4);
}

function addParagraph(text) {
  doc.fontSize(10.5).font('Helvetica').fillColor('#334155').text(text, { lineGap: 3, align: 'justify' });
  doc.moveDown(0.8);
}

function addBullet(bulletText) {
  doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`•  ${bulletText}`, { indent: 15, lineGap: 2 });
  doc.moveDown(0.3);
}

// Content
addTitle('Acme Global Technologies Inc.');
addSubtitle('Comprehensive Workplace Policies & Employee Handbook (Effective 2026)');

// Section 1: Working Hours
addSectionHeader('1', 'Working Hours & Core Attendance');
addParagraph(
  'Acme Global Technologies operates on a standard 40-hour work week, Monday through Friday. Standard office hours are from 9:00 AM to 5:00 PM EST. To facilitate cross-timezone collaboration, all full-time employees are expected to be online and available during "Core Collaboration Hours" between 10:00 AM and 3:00 PM EST.'
);
addBullet('Flexible Scheduling: Employees may adjust start times between 7:00 AM and 10:00 AM with manager pre-approval.');
addBullet('Meal Breaks: A mandatory 60-minute unpaid lunch break is required for any work shift exceeding 6 hours.');
addBullet('Overtime Eligibility: Overtime pay (1.5x standard hourly rate) is applicable only to non-exempt roles with written supervisory approval.');

// Section 2: Vacation & Paid Time Off
addSectionHeader('2', 'Vacation and Paid Time Off (PTO)');
addParagraph(
  'All full-time permanent employees receive 20 days of Paid Time Off (PTO) per calendar year, accrued at a rate of 1.67 days per month. Part-time employees receive prorated PTO based on agreed working hours.'
);
addBullet('Carryover Policy: A maximum of 5 unused PTO days can be rolled over to the subsequent calendar year, which must be utilized before March 31.');
addBullet('Advance Notice: Vacation requests exceeding 3 consecutive days must be submitted through the HR portal at least 2 weeks in advance.');
addBullet('Blackout Dates: PTO may be restricted during the annual Q4 product release sprint (November 15 to December 1), unless emergency approval is granted.');

// Section 3: Sick Leave & Health Accommodations
addSectionHeader('3', 'Sick Leave and Medical Absence');
addParagraph(
  'Acme Global provides 10 dedicated paid sick days per year, credited on January 1st of each calendar year. Sick leave is independent of standard vacation PTO and does not roll over.'
);
addBullet('Notification Requirement: Employees must notify their immediate supervisor by 8:30 AM on the day of unplanned absence.');
addBullet('Medical Certification: A signed physician note or medical certificate is strictly required for consecutive sick leaves exceeding 3 business days.');
addBullet('Mental Health Days: Employees may allocate up to 3 of their annual sick days as personal wellness/mental health recharge days without medical documentation.');

// Page Break for clarity
doc.addPage();

// Section 4: Remote Work & Flexible Arrangement
addSectionHeader('4', 'Remote Work and Home Office Policy');
addParagraph(
  'Acme Global embraces a hybrid and remote-first culture for eligible engineering, design, and operations personnel. Employees working remotely must maintain a secure, ergonomic workspace and high-speed internet (minimum 50 Mbps download speed).'
);
addBullet('Remote Work Stipend: Remote employees receive a one-time $500 home workstation setup grant upon hire and a recurring $75 monthly internet and utility subsidy.');
addBullet('Security Protocol: Company work must strictly be conducted on company-managed devices with active endpoint protection and corporate VPN enabled.');
addBullet('Relocation Notice: Remote employees changing primary residences or states must give 30 days prior written notice to People Operations for tax compliance.');

// Section 5: Expense Reimbursement
addSectionHeader('5', 'Expense Reimbursement & Travel Policy');
addParagraph(
  'Employees will be reimbursed for reasonable and authorized expenses incurred in the direct execution of business duties. All claims must be accompanied by itemized digital receipts and submitted through Expensify.'
);
addBullet('Submission Deadline: Expense reports must be submitted within 30 days of the transaction date; late claims may be denied.');
addBullet('Meal Allowances on Travel: Business travel meals are capped at $75 per day ($15 Breakfast, $25 Lunch, $35 Dinner). Alcohol is non-reimbursable.');
addBullet('Mileage Reimbursement: Personal vehicle usage for corporate travel is reimbursed at $0.67 per mile.');
addBullet('Approval Thresholds: Single purchases exceeding $1,000 require Department VP approval prior to expenditure.');

// Section 6: Equipment, Upgrades & Asset Management
addSectionHeader('6', 'Company Equipment and Asset Return');
addParagraph(
  'Acme Global equips all technical staff with a standardized workstation package, consisting of an Apple MacBook Pro M-series or Lenovo ThinkPad X1 Carbon, dual 27-inch 4K monitors, ergonomic peripherals, and noise-cancelling headphones.'
);
addBullet('Refresh Cycle: Primary laptops are eligible for standard hardware replacement and performance refresh every 36 months.');
addBullet('Software Installations: Only software approved by IT Security (listed in the Acme App Catalog) may be installed on corporate hardware.');
addBullet('Separation & Return of Equipment: Upon resignation or termination, all company-provided equipment, access cards, and security dongles must be returned to the IT Asset Depot within 7 calendar days. Prepaid return shipping labels are provided by HR.');

// Final Note
doc.moveDown(1.5);
doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
doc.moveDown(0.8);
doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94a3b8').text(
  'Confidential - Acme Global Technologies Internal HR Policy Document. For inquiries, contact hr-support@acmeglobal.com.',
  { align: 'center' }
);

doc.end();

writeStream.on('finish', () => {
  console.log(`Successfully generated sample PDF at: ${outputPath}`);
});
