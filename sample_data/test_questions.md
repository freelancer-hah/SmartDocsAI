# SmartDocs AI – Test Question Evaluation Suite

This document contains 12 evaluation questions designed to validate the **SmartDocs AI** Retrieval-Augmented Generation (RAG) system against the **Acme Global Technologies Inc. Workplace Policy Handbook (2026)**.

---

## 📋 Evaluation Matrix

| # | Test Question | Category | Expected Ground Truth / Verification | Found in Document? |
|---|---|---|---|:---:|
| **1** | What are the core collaboration hours when employees must be online? | Working Hours | Employees are expected to be online and available between **10:00 AM and 3:00 PM EST**. | ✅ **YES** |
| **2** | How many days of Paid Time Off (PTO) do full-time employees receive annually, and how many can rollover? | Vacation / PTO | Full-time employees receive **20 days of PTO per year** (accrued at 1.67 days/month). A maximum of **5 unused PTO days** can roll over to the next year (must be used before March 31). | ✅ **YES** |
| **3** | When is a physician note or medical certificate required for sick leave? | Sick Leave | A signed physician note or medical certificate is strictly required for consecutive sick leaves exceeding **3 business days**. | ✅ **YES** |
| **4** | What is the financial assistance provided for remote work setup and internet? | Remote Work | A one-time **$500 home workstation setup grant** upon hire, plus a recurring **$75 monthly internet and utility subsidy**. | ✅ **YES** |
| **5** | What is the daily travel meal allowance limit, and is alcohol reimbursed? | Expense Reimbursement | Business travel meals are capped at **$75 per day** ($15 Breakfast, $25 Lunch, $35 Dinner). **Alcohol is strictly non-reimbursable**. | ✅ **YES** |
| **6** | What is the deadline for returning company equipment after resignation or termination? | Equipment | All equipment, access cards, and security dongles must be returned to the IT Asset Depot within **7 calendar days** of departure. | ✅ **YES** |
| **7** | How often are primary work laptops refreshed or upgraded? | Equipment | Primary laptops are eligible for standard hardware replacement and performance refresh every **36 months (3 years)**. | ✅ **YES** |
| **8** | By what time must an employee notify their supervisor if they are taking an unplanned sick day? | Sick Leave | Employees must notify their immediate supervisor by **8:30 AM** on the day of unplanned absence. | ✅ **YES** |
| **9** | What is the mileage reimbursement rate for personal vehicle usage? | Expense Reimbursement | Personal vehicle usage for corporate travel is reimbursed at **$0.67 per mile**. | ✅ **YES** |
| **10** | Can employees take mental health recharge days under the sick leave policy? | Sick Leave | Yes, employees may use up to **3 of their annual sick days** as personal wellness/mental health recharge days without medical documentation. | ✅ **YES** |
| **11** | What is the company's 401(k) matching percentage and stock option vesting schedule? | Unrelated / Out-of-Scope | **NOT PRESENT in document**. The AI system MUST respond stating this information is not found in the policy document rather than hallucinating. | ❌ **NO** |
| **12** | What is the company dress code policy for casual Fridays? | Unrelated / Out-of-Scope | **NOT PRESENT in document**. The AI system MUST explicitly decline to answer and note absence from the document. | ❌ **NO** |

---

## 🔍 Validation Criteria
- **Groundedness**: Answers for questions 1-10 must match facts strictly from the handbook.
- **Hallucination Prevention**: For questions 11 and 12, the model must explicitly refuse or indicate that the information is absent.
- **Attribution**: Relevant section citations (e.g. `Section 4: Remote Work and Home Office Policy`) should be displayed in the UI.
    