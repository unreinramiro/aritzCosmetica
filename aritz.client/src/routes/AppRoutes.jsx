/// <reference path="../components/checkoutsteps/shippinginfo.jsx" />
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Product from '../pages/Products/Products';
import Contact from '../pages/Contact';
import Auth from '../components/Auth/Auth';
import Cart from '../components/Cart/Cart';
import ShippingInfo from '../components/CheckoutSteps/ShippingInfo';
import ShippingMehod from '../components/CheckoutSteps/PaymentMethod';
import PaymentInfo from '../components/CheckoutSteps/PaymentInfo';
import Success from '../pages/Checkout/Success';
import ProductDetail from '../pages/Products/ProductDetail';
import MyRequests from '../pages/Requests/MyRequests';
import MyRequestDetail from '../pages/Requests/MyRequestDetail';
import MyAccount from '../pages/Account/MyAccount';
import AdminManage from '../components/Admin/AdminManage';
import AdminProducts from '../components/Admin/AdminProducts';
import AdminUsers from '../components/Admin/AdminUsers';
import AdminPostalCodes from '../components/Admin/AdminPostalCodes';
import Failure from '../pages/Checkout/Failure';
import Pending from '../pages/Checkout/Pending';
import NotFound from '../components/NotFound';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout/shipping-info" element={<ShippingInfo />} />
                <Route path="/checkout/payment-method" element={<ShippingMehod />} />
                <Route path="/checkout/pay" element={<PaymentInfo />} />
                <Route path="/checkout/pay-success" element={<Success />} />
                <Route path="/checkout/pay-failure" element={<Failure />} />
                <Route path="/checkout/pay-pending" element={<Pending />} />
                <Route path="/product/product-detail/:id" element={<ProductDetail />} />
                <Route path="/user/my-requests" element={<MyRequests />} />
                <Route path="/user/my-requests/my-order/:id" element={<MyRequestDetail />} />
                <Route path="/user/my-account" element={<MyAccount />} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/management" element={<AdminManage />} />
                <Route path="/admin/management/products" element={<AdminProducts />} />
                <Route path="/admin/management/users" element={<AdminUsers />} />
                <Route path="/admin/management/postalCodes" element={<AdminPostalCodes />} />
            </Route>

            <Route path="/notFound" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/notFound" replace />} />

        </Routes>
    );
};

export default AppRoutes;