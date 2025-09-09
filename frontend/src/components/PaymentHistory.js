import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  DollarSign,
  CreditCard,
  Receipt,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const PaymentHistory = ({ userSubscription }) => {
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load payment history from localStorage or simulate
    const savedPayments = localStorage.getItem("paymentHistory");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      // Generate mock payment history
      const mockPayments = [
        {
          id: "pay_1234567890",
          amount: 99.0,
          status: "completed",
          date: "2025-08-15",
          description: "Professional Plan - Monthly Subscription",
          method: "Visa ****4242",
          invoice: "INV-2025-001",
          type: "subscription",
        },
        {
          id: "pay_0987654321",
          amount: 49.0,
          status: "completed",
          date: "2025-07-15",
          description: "Basic Plan - Monthly Subscription",
          method: "Mastercard ****8888",
          invoice: "INV-2025-002",
          type: "subscription",
        },
        {
          id: "pay_1122334455",
          amount: 25.0,
          status: "completed",
          date: "2025-07-10",
          description: "AI Proposal Generation - Premium Feature",
          method: "Visa ****4242",
          invoice: "INV-2025-003",
          type: "one-time",
        },
        {
          id: "pay_5566778899",
          amount: 99.0,
          status: "pending",
          date: "2025-09-08",
          description: "Professional Plan - Monthly Subscription",
          method: "Visa ****4242",
          invoice: "INV-2025-004",
          type: "subscription",
        },
      ];
      setPayments(mockPayments);
      localStorage.setItem("paymentHistory", JSON.stringify(mockPayments));
    }
  }, []);

  const filteredPayments = payments
    .filter((payment) => {
      const matchesStatus =
        filterStatus === "all" || payment.status === filterStatus;
      const matchesSearch =
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoice.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleDownloadInvoice = (payment) => {
    // Simulate invoice download
    const invoiceContent = `
INVOICE: ${payment.invoice}
Date: ${payment.date}
Amount: $${payment.amount.toFixed(2)}
Description: ${payment.description}
Payment Method: ${payment.method}
Status: ${payment.status.toUpperCase()}

Thank you for your business!
    `;

    const element = document.createElement("a");
    const file = new Blob([invoiceContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${payment.invoice}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Receipt className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <p className="text-2xl font-bold text-gray-900">
                {userSubscription ? userSubscription.name : "Free"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredPayments.length} of {payments.length} transactions
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.method} • {payment.invoice}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadInvoice(payment)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Your payment history will appear here once you make your first transaction."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
