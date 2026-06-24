import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter the loan amount",
    description:
      "Type the principal — the total amount you borrow before interest, such as a home price minus down payment or auto loan balance.",
  },
  {
    title: "Set the annual interest rate",
    description:
      "Enter the yearly interest rate as a percentage. Use the APR quoted by your lender for fixed-rate loans.",
  },
  {
    title: "Choose the loan term",
    description:
      "Enter how long you will repay the loan in years or months. Common mortgages are 15 or 30 years.",
  },
  {
    title: "Review payment and total cost",
    description:
      "See your estimated monthly payment, total amount paid over the life of the loan, and total interest charged.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is the monthly payment calculated?",
    answer:
      "This calculator uses the standard amortization formula for fixed-rate loans. It spreads principal and interest evenly across equal monthly payments.",
  },
  {
    question: "Does this include taxes and insurance?",
    answer:
      "No. The monthly payment shown covers principal and interest only. Property taxes, homeowners insurance, PMI, and HOA fees are not included.",
  },
  {
    question: "Can I calculate a mortgage or car loan?",
    answer:
      "Yes. Enter any fixed-rate loan amount, APR, and term. The same formula applies to mortgages, auto loans, and personal loans.",
  },
  {
    question: "What happens if the interest rate is 0%?",
    answer:
      "At 0% interest, the monthly payment is simply the loan amount divided by the number of months — no interest is added.",
  },
];
