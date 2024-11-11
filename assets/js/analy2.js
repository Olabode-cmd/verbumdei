import { api } from "./api.js";

// Fetch the API data and update both the donut chart and payment details
async function loadPaymentsAndUpdateChart() {
  try {
    // Fetch the payment data from the API
    const response = await fetch(
      `${api}/payment/physical-payments/`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch payment data");
    }
    const payments = await response.json();

    // If no payments, stop the function
    if (!payments || payments.length === 0) {
      console.error("No payment data available");
      return; // Exit if no data is available
    }

    // Initialize categories and series data
    const categories = {};

    // Process the payments data to categorize and sum the payments
    payments.forEach((payment) => {
      const category = payment.payment_name.payment_name; // e.g., 'SCHOOL FEE'
      const amountPaid = payment.amount_paid;
      const totalAmount = payment.payment_name.amount;

      // Aggregate the payments by category
      if (!categories[category]) {
        categories[category] = { amountPaid: 0, totalAmount: 0 };
      }
      categories[category].amountPaid += amountPaid;
      categories[category].totalAmount += totalAmount;
    });

    // Extract the data for the chart
    const categoryLabels = Object.keys(categories);
    const seriesData = categoryLabels.map(
      (category) => categories[category].amountPaid
    );

    if (seriesData.length === 0 || categoryLabels.length === 0) {
      console.error("No valid data for chart rendering");
      return; // Exit if no valid data for chart
    }

    // Update the donut chart
    updateDonutChart(seriesData, categoryLabels);

    // Update the payment details (you can call the earlier code for this)
    updatePaymentDetails(categories);
  } catch (error) {
    console.error("Error fetching payment data:", error);
  }
}

// Function to update the donut chart dynamically
function updateDonutChart(seriesData, categoryLabels) {
  console.log("Series Data:", seriesData);
  console.log("Category Labels:", categoryLabels);

  // Ensure we have data to render
  if (!seriesData.length || !categoryLabels.length) {
    console.error("No data available to render the chart");
    return; // Exit if there's no data
  }

  const totalAmount = seriesData.reduce((sum, value) => sum + value, 0); // Calculate total amount

  var options = {
    series: seriesData, // Dynamic data
    chart: {
      height: 350,
      type: "donut",
      offsetY: 0,
      offsetX: 0,
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
          },
        },
      ],
    },
    labels: categoryLabels, // Dynamic categories
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => formatTotalValue(totalAmount), // Format total value
            },
          },
        },
      },
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["#fff"],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return "₦" + formatTotalValue(value); // Format value with K or M
        },
      },
    },
  };

  // Destroy the existing chart if it exists
  if (window.chart) {
    window.chart.destroy();
  }

  console.log("Rendering chart...");
  // Create a new chart instance
  window.chart = new ApexCharts(
    document.querySelector("#categoryBreakdown"),
    options
  );
  window.chart.render();
  console.log("Chart rendered successfully");
}

// Function to update the payment details (text info below the chart)
function updatePaymentDetails(categories) {
  const paymentsContainer = document.getElementById("categoryDetails");
  paymentsContainer.innerHTML = ""; // Clear previous content

  Object.keys(categories).forEach((category) => {
    const { amountPaid, totalAmount } = categories[category];
    const percentagePaid = ((amountPaid / totalAmount) * 100).toFixed(2);

    const paymentHTML = `
            <div class="border-b border-gray-300 py-1 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="bg-green-500 p-1 rounded-full"></span>
                    <p class="font-medium text-sm">${category}</p>
                </div>
                <p class="font-medium text-sm">${percentagePaid}%</p>
            </div>
        `;

    paymentsContainer.insertAdjacentHTML("beforeend", paymentHTML);
  });
}

// Helper function to format the total value (for tooltip and total label)
function formatTotalValue(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + "K";
  } else {
    return value;
  }
}

// Load the payments and update the chart and details
loadPaymentsAndUpdateChart();
