import React from 'react'
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import Model from '../../components/Model';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/Charts/DeleteAlert';

const Expense = () => {
    useUserAuth();
      const [expenseData, setExpenseData] = useState([]);
      const [loading, setLoading] = useState(false);
      const [openAddExpenseModel, setOpenAddExpenseModel] = useState(false);
      const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
      });

   // Get All Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
      if (response.data) setExpenseData(response.data);
    } catch (error) {
      console.log('Something went wrong', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    if (!category.trim()) return toast.error('Category is required.');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return toast.error('Amount should be a valid number greater than 0.');
    if (!date) return toast.error('Date is required.');

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      // Optimistic update so the chart updates immediately
      setExpenseData((prev) => [...prev, { category, amount: Number(amount), date, icon }]);

      setOpenAddExpenseModel(false);
      toast.success('Income added successfully');
      // Optional: re-fetch to stay perfectly in sync with backend
      fetchExpenseDetails();
    } catch (error) {
      console.error('Error adding expense:', error.response?.data?.message || error.message);
    }
  };

  //Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success('Expense deleted');
      fetchExpenseDetails();
    } catch (error) {
      console.error('Error deleting expense:', error.response?.data?.message || error.message);
    }
  };

  // Download Expense details
  const handleDownloadExpenseDetails = async () => {
    try{
      const respone = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([respone.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download","expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch(error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details. Please try again.")
    }
  };

  useEffect(() => {
    fetchExpenseDetails();

    return () => {};
  }, []);

  return (
     <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <ExpenseOverview
              transactions = {expenseData}
              onExpenseIncome = {() => setOpenAddExpenseModel(true)}
              />
          </div>
         <ExpenseList
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })} 
            onDownload={handleDownloadExpenseDetails}
          />
        </div>

        <Model
          isOpen = {openAddExpenseModel}
          onClose = {() => setOpenAddExpenseModel(false)}
          title = "Add Expense"
          >
            <AddExpenseForm onAddExpense = {handleAddExpense} />
          </Model>
      </div>
      <Model
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({ show: false, data: null })} 
        title="Delete Expense"
      >
        <DeleteAlert
          content="Are you sure you want to delete this expense detail?"
          onDelete={() => deleteExpense(openDeleteAlert.data)}
        />
      </Model>
      </DashboardLayout>
  )
}

export default Expense