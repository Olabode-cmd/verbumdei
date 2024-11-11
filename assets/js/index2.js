import { api } from "./api.js";


const token = localStorage.getItem("authToken");


async function fetchPaymentData() {
  try {
    const response = await fetch(`${api}/payment/physical-payments/`, {
      headers : {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching payment data:", error);
    return [];
  }
};

function processPaymentData(payments) {
  const totalPayments = {};

  payments.forEach((payment) => {
    const date = new Date(payment.time).toLocaleDateString(); // Use the date part
    const amountPaid = payment.amount_paid;

    if (!totalPayments[date]) {
      totalPayments[date] = 0;
    }
    totalPayments[date] += amountPaid;
  });

  const dates = Object.keys(totalPayments);
  const amounts = Object.values(totalPayments);

  return { dates, amounts };
}

async function updateCharts() {
  const payments = await fetchPaymentData();
  const { dates, amounts } = processPaymentData(payments);

  var options = {
    chart: {
      height: 395,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    colors: ["#007BFF", "#00E396"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    series: [
      {
        name: "Payments",
        data: amounts,
      },
    ],
    xaxis: {
      categories: dates,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value.toFixed(0);
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 5,
      colors: ["#007BFF"],
      strokeColor: "#fff",
      strokeWidth: 2,
    },
    tooltip: {
      theme: "light",
    },
    grid: {
      borderColor: "#e7e7e7",
      strokeDashArray: 5,
    },
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

document.addEventListener("DOMContentLoaded", function () {
  updateCharts();
});
