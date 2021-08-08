import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import DashboardView from 'src/views/reports/DashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
import StaffView from 'src/views/Staff'
import CreateStaffView from 'src/views/Staff/CreateStaff'
import PasswordUpdateView from 'src/views/Staff/UpdatePassword'
import CustomerView from 'src/views/Customer'
import EditCustomerView from 'src/views/Customer/EditCustomer'
import RegisterCustomerView from 'src/views/Customer/RegisterCustomer'
import InvestmentView from "src/views/Investment"
import CryptoInvestmentView from "src/views/Investment/CryptoInvestment"
import AddInvestmentView from "src/views/Investment/AddInvestment"
import PaymentView from "src/views/Payment"
import FortInvestmentView from "src/views/FortInvestment"
import AddFortInvestmentView from "src/views/FortInvestment/AddInvestment"
import EditFortInvestmentView from "src/views/FortInvestment/EditInvestment"
import SocialContractView from "src/views/SocialMedia"
import AddContractView from "src/views/SocialMedia/AddContract"
import EditContractView from "src/views/SocialMedia/EditContract"
import IncomeExpensesView from "src/views/IncomeExpenses"
import AddIncomeExpensesView from "src/views/IncomeExpenses/AddIncomeExpenses"

const routes = [
  {
    path: 'app',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'staffs', element: <StaffView /> },
      { path: 'create-staff', element: <CreateStaffView /> },
      { path: 'pwd-update', element: <PasswordUpdateView /> },
      { path: 'customers', element: <CustomerView /> },
      { path: 'register-customer', element: <RegisterCustomerView /> },
      { path: 'edit-customer/:id', element: <EditCustomerView /> },
      { path: 'investments', element: <InvestmentView /> },
      { path: 'crypto-investments', element: <CryptoInvestmentView /> },
      { path: 'add-investment', element: <AddInvestmentView /> },
      { path: 'ca-investments', element: <FortInvestmentView /> },
      { path: 'add-ca-investment', element: <AddFortInvestmentView /> },
      { path: 'edit-ca-investment/:id', element: <EditFortInvestmentView /> },
      { path: 'payments', element: <PaymentView /> },
      { path: 'income-expenses', element: <IncomeExpensesView /> },
      { path: 'add-income-expenses', element: <AddIncomeExpensesView /> },
      { path: '*', element: <Navigate replace={false} to="/404" /> }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/login" /> },
      { path: '*', element: <Navigate replace={false} to="/404" /> }
    ]
  }
];

export default routes;
