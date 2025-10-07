import React, { useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useState } from 'react';
import IncomeOverview from '../../components/Income/IncomeOverview';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Model from '../../components/Model';
import AddIncomeForm from '../../components/Income/AddIncomeForm';

const Income = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const[openDeleteAlert, setOpenDeleteAlert] = useState({
    show:false,
    data:null,
  })

  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false);

  //Get All Income Details
  const fetctIncomeDetails = async () => {
     if (loading) return; // Prevent multiple fetches
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);

      if(response.data){
        setIncomeData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong", error);
    } finally {
      setLoading(false);  
    };
  };


  //Handle Add Income
  const handleAddIncome = async ( income) => {};
  
  //Delete Income
  const deleteIncome = async ( id) => {};

  //handle download income details
  const handleDownloadIncomeDetails = async () => {};


  useEffect (() => {
    fetctIncomeDetails();

    return () => {};
  }, []);

  return (
   <DashboardLayout activeMenu = "Income">
    <div className='my-5 mx-auto' ></div>
    <div className='grid grid-cols-1 gap-6'>
      <div className=''>
        <IncomeOverview
          transactions = {incomeData}
          onAddIncome= {() => setOpenAddIncomeModel(true)}
          />
      </div>
    </div>
    <Model
      isOpen = {openAddIncomeModel}
      onClose = {() => setOpenAddIncomeModel(false)}
      title = "Add Income"
      >
        <AddIncomeForm onAddIncome = {handleAddIncome} />

      </Model>
    </DashboardLayout>
  )
}

export default Income