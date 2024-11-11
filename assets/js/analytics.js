import { api } from "./api.js";

let cachedPayments = [];
let cachedExpenses = [];

async function fetchPaymentData() {
  const response = await fetch(`${api}/payment/physical-payments/`);
  cachedPayments = await response.json();
  return cachedPayments;
}

async function fetchExpenseData() {
  const response = await fetch(`${api}/inventory/all-inventory/`);
  cachedExpenses = await response.json();
  return cachedExpenses;
}

async function loadData() {
  await Promise.all([fetchPaymentData(), fetchExpenseData()]);
  updateCombinedChart();
}

function updateCombinedChart() {
  const incomeData = [];
  const outstandingData = [];
  const expenseData = [];
  const categories = new Set(); // Use a set to avoid duplicate dates

  // Process payments for income and outstanding data
  cachedPayments.forEach((payment) => {
    const paymentDate = new Date(
      payment.payment_name.created_at
    ).toLocaleDateString();
    categories.add(paymentDate);
    incomeData.push({ date: paymentDate, amount: payment.amount_paid });
    outstandingData.push({ date: paymentDate, amount: payment.balance });
  });

  // Process expenses for expense data
  cachedExpenses.forEach((expense) => {
    const expenseDate = new Date(expense.time_of_purchase).toLocaleDateString();
    categories.add(expenseDate);
    expenseData.push({ date: expenseDate, amount: expense.total_cost });
  });

  // Convert the Set of categories into an array and sort the dates
  const sortedCategories = Array.from(categories).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Map income, outstanding, and expense data to match sorted categories
  const incomeSeries = mapDataToCategories(incomeData, sortedCategories);
  const outstandingSeries = mapDataToCategories(
    outstandingData,
    sortedCategories
  );
  const expenseSeries = mapDataToCategories(expenseData, sortedCategories);

  const options = createCombinedChartOptions(
    incomeSeries,
    outstandingSeries,
    expenseSeries,
    sortedCategories
  );
  renderChart("#combinedChart", options);
}

// Helper function to map data to categories (dates)
function mapDataToCategories(data, categories) {
  const mappedData = categories.map((category) => {
    const item = data.find((entry) => entry.date === category);
    return item ? item.amount : 0; // If no data for the date, return 0
  });
  return mappedData;
}

// Function to create combined chart options
function createCombinedChartOptions(
  incomeData,
  outstandingData,
  expenseData,
  categories
) {
  return {
    series: [
      {
        name: "Income",
        data: incomeData,
        color: "#00E396", // Set the color for income
      },
      {
        name: "Outstanding",
        data: outstandingData,
        color: "#FF4560", // Set the color for outstanding
      },
      {
        name: "Expenses",
        data: expenseData,
        color: "#775DD0", // Set the color for expenses
      },
    ],
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ["No Data"],
    },
    yaxis: {
      title: {
        text: "Amount (₦)",
      },
      labels: {
        formatter: function (value) {
          return "₦" + value.toLocaleString();
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return "₦" + value.toLocaleString();
        },
      },
    },
    legend: {
      position: "top", // Display the legend at the top
    },
  };
}

function renderChart(selector, options) {
  const chart = new ApexCharts(document.querySelector(selector), options);
  chart.render();
}

// Load data and render the combined chart on initial load
loadData();


// Fetch data from the API
async function fetchCategoryData() {
  try {
    const response = await fetch(
      `${api}/payment/physical-payments/`
    );
    const data = await response.json();

    // Initialize category sums
    const categoryTotals = {
      "School Fees": 0,

    };

    // Process the data to accumulate payments by category (modify based on actual categories in API)
    data.forEach((payment) => {
      const paymentName = payment.payment_name.payment_name; // Example: "SCHOOL FEE", "SPORT", etc.
      const amountPaid = payment.amount_paid;

      // Map API categories to donut chart labels
      if (paymentName.includes("SCHOOL FEE")) {
        categoryTotals["School Fees"] += amountPaid;
      } else if (paymentName.includes("SPORT")) {
        categoryTotals["Sport"] += amountPaid;
      } else if (paymentName.includes("MEDICAL")) {
        categoryTotals["Medical"] += amountPaid;
      }
    });

    // Update the chart with the processed data
    updateDonutChart(Object.values(categoryTotals));
  } catch (error) {
    console.error("Error fetching payment data:", error);
  }
}

// Function to format numbers for the total label (K for thousands and M for millions)
function formatTotalValue(val) {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + "M";
  } else if (val >= 1000) {
    return (val / 1000).toFixed(1) + "K";
  }
  return val;
}

// Function to update the donut chart with new data
// function updateDonutChart(seriesData) {
//   const totalAmount = seriesData.reduce((sum, value) => sum + value, 0); // Calculate total amount

//   var options = {
//     series: seriesData, // Dynamic data
//     chart: {
//       height: 350,
//       type: "donut",
//     },
//     labels: ["School Fees", "Sport", "Medical"], // Categories
//     colors: ["#4CAF50", "#FF9800", "#F44336"],
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "65%",
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: "Total",
//               formatter: () => formatTotalValue(totalAmount), // Format total value
//             },
//           },
//         },
//       },
//     },
//     stroke: {
//       show: true,
//       width: 10,
//       colors: ["#fff"],
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     legend: {
//       show: false,
//     },
//     tooltip: {
//       y: {
//         formatter: function (value) {
//           return "₦" + formatTotalValue(value); // Format value with K or M
//         },
//       },
//     },
//   };

//   var chart = new ApexCharts(
//     document.querySelector("#categoryBreakdown"),
//     options
//   );
//   chart.render();
// }

// Call fetchCategoryData to populate the chart
fetchCategoryData();

// Fetch data from the API
async function fetchData() {
  try {
    const response = await fetch(
      `${api}/payment/physical-payments/`
    );
    const data = await response.json();

    // Process the data to extract unique grades and corresponding amounts
    const gradeMap = {};

    // Iterate over each payment and organize data by grade
    data.forEach((payment) => {
      const grade = payment.payment_name.grade;
      if (!gradeMap[grade]) {
        gradeMap[grade] = { paid: 0, unpaid: 0 };
      }

      gradeMap[grade].paid += payment.amount_paid; // Use raw amount (not converting here)
      gradeMap[grade].unpaid += payment.balance; // Use raw amount
    });

    // Separate grades (categories), paid data, and unpaid data
    const categories = Object.keys(gradeMap);
    const paidData = categories.map((grade) => gradeMap[grade].paid);
    const unpaidData = categories.map((grade) => gradeMap[grade].unpaid);

    // Update the chart with the processed data
    updateChart(categories, paidData, unpaidData);
  } catch (error) {
    console.error("Error fetching payment data:", error);
  }
}

// Function to format numbers into K for thousands and M for millions
function formatValue(val) {
  if (val >= 1000000) {
    return "₦" + (val / 1000000).toFixed(1) + "M"; // Convert to millions
  } else if (val >= 1000) {
    return "₦" + (val / 1000).toFixed(1) + "K"; // Convert to thousands
  }
  return "₦" + val; // No conversion needed
}

// Function to update the chart with new data
function updateChart(categories, paidData, unpaidData) {
  var options = {
    series: [
      {
        name: "Paid",
        data: paidData,
      },
      {
        name: "Unpaid",
        data: unpaidData,
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        endingShape: "rounded",
      },
    },
    colors: ["#4CAF50", "#F44336"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories, // Use dynamic categories from API
    },
    yaxis: {
      title: {
        text: "Amount",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatValue(val); // Use the formatValue function for tooltips
        },
      },
    },
    legend: {
      show: false,
    },
  };

  var chart = new ApexCharts(document.querySelector("#schoolFees"), options);
  chart.render();
}

 async function totalDebt() {
   try {
     const response = await fetch(`${api}/payment/total-dept/`, {
       method: "GET",
       headers: {
         "Content-Type": "application/json",
       },
     });

     if (response.ok) {
       const totalData = await response.json();
       const sum = totalData.total_debt_for_current_month;
       const perc = totalData.percentage_change;

       const sumElement = document.getElementById("total-debt");
       const percElement = document.getElementById("dept-perc");

       if (sumElement) {
         sumElement.textContent = sum;
       }
       if (percElement) {
         percElement.textContent = perc;
       }
     } else {
       console.error("Failed to fetch debt data");
     }
   } catch (error) {
     console.error("Error:", error);
   }
 }
 totalDebt();

// Call fetchData to populate the chart
fetchData();
