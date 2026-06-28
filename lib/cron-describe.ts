const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function describeField(
  field: string,
  allLabel: string,
  names?: readonly string[],
  offset = 0
): string {
  if (field === "*") return allLabel;
  if (field.startsWith("*/")) {
    const step = field.slice(2);
    return `every ${step}`;
  }
  if (field.includes("-") && !field.includes(",")) {
    const [a, b] = field.split("-");
    const from = names ? names[parseInt(a, 10) - offset] ?? a : a;
    const to = names ? names[parseInt(b, 10) - offset] ?? b : b;
    return `from ${from} through ${to}`;
  }
  if (field.includes(",")) {
    const parts = field.split(",").map((p) => {
      if (names) {
        const n = parseInt(p, 10);
        return names[n - offset] ?? p;
      }
      return p;
    });
    return parts.join(", ");
  }
  if (names) {
    const n = parseInt(field, 10);
    return names[n - offset] ?? field;
  }
  return field;
}

function describeTime(minute: string, hour: string): string {
  if (minute === "*" && hour === "*") return "every minute";
  if (minute.startsWith("*/") && hour === "*") {
    return `every ${minute.slice(2)} minutes`;
  }
  if (hour === "*" && minute !== "*") {
    return `at minute ${minute} of every hour`;
  }
  if (hour !== "*" && minute === "*") {
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `every minute past ${h12}:00 ${ampm}`;
  }

  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return `at ${hour}:${minute}`;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const mm = m.toString().padStart(2, "0");
  return `at ${h12}:${mm} ${ampm}`;
}

export function describeCron(expression: string): string | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const timePart = describeTime(minute, hour);
  const dayPart =
    dayOfMonth === "*" && dayOfWeek === "*"
      ? "every day"
      : dayOfMonth !== "*"
        ? `on day-of-month ${describeField(dayOfMonth, "every day")}`
        : `on ${describeField(dayOfWeek, "every day of the week", WEEKDAYS, 0)}`;

  const monthPart =
    month === "*" ? "" : ` in ${describeField(month, "every month", MONTHS, 1)}`;

  return `Runs ${timePart}, ${dayPart}${monthPart}.`;
}
