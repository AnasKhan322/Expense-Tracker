import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import IncomeOverview from '../../components/Income/IncomeOverview';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Model from '../../components/Model';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/Charts/DeleteAlert';
import { useUserAuth } from '../../hooks/useUserAuth';

const Income = () => {
    useUserAuth();
  
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  // Get All Income Details
  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      if (response.data) setIncomeData(response.data);
    } catch (error) {
      console.log('Something went wrong', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Income
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    if (!source.trim()) return toast.error('Source is required.');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error('Amount should be a valid number greater than 0.');
    if (!date) return toast.error('Date is required.');

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });

      // Optimistic update so the chart updates immediately
      setIncomeData((prev) => [...prev, { source, amount: Number(amount), date, icon }]);

      setOpenAddIncomeModel(false);
      toast.success('Income added successfully');
      // Optional: re-fetch to stay perfectly in sync with backend
      fetchIncomeDetails();
    } catch (error) {
      console.error('Error adding income:', error.response?.data?.message || error.message);
    }
  };

  // Delete Income
  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success('Income deleted');
      fetchIncomeDetails();
    } catch (error) {
      console.error('Error deleting income:', error.response?.data?.message || error.message);
    }
  };

  // Download income details
  const handleDownloadIncomeDetails = async () => {
    try{
      const respone = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([respone.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download","income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch(error) {
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details. Please try again.")
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModel(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })} 
            onDownload={handleDownloadIncomeDetails}
          />
        </div>

        {/* Add Income Modal */}
        <Model
          isOpen={openAddIncomeModel}
          onClose={() => setOpenAddIncomeModel(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Model>
      </div>

      {/* Delete Confirm Modal — only ONE, and it shows DeleteAlert */}
      <Model
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({ show: false, data: null })} 
        title="Delete Income"
      >
        <DeleteAlert
          content="Are you sure you want to delete this income detail?"
          onDelete={() => deleteIncome(openDeleteAlert.data)}
        />
      </Model>
    </DashboardLayout>
  );
};

export default Income;
