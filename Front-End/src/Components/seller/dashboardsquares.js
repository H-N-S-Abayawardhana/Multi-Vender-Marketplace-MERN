import React from 'react';
import { useNavigate } from "react-router-dom";
import { Store, Package, Users, MessageSquare, LineChart, PlusCircle } from "lucide-react";
import '../../css/seller/sellerdashboard.css';

const DashboardSquares = () => {
    const navigate = useNavigate();
    
    const dashboardItems = [
        {
            title: "Create a Store",
            icon: <PlusCircle className="dashboard-icon" />,
            path: "/add-store",
            description: "Set up a new store front",
            bgClass: "create-store",
            disabled: false
        },
        {
            title: "My Store",
            icon: <Store className="dashboard-icon" />,
            path: "/stores",
            description: "Manage your existing store",
            bgClass: "my-stores",
            disabled: false
        },
        {
            title: "Add New Items",
            icon: <Package className="dashboard-icon" />,
            path: "/add-items",
            description: "List new products for sale",
            bgClass: "add-items",
            disabled: false
        },
        {
            title: "Customers",
            icon: <Users className="dashboard-icon" />,
            path: "/seller-customer-list",
            description: "View customer information",
            bgClass: "customers",
            disabled: false
        },
        {
            title: "Messages",
            icon: <MessageSquare className="dashboard-icon" />,
            path: "/messages",
            description: "Chat with customers (Coming Soon)",
            bgClass: "messages",
            disabled: true
        },
        {
            title: "My Analytics",
            icon: <LineChart className="dashboard-icon" />,
            path: "/seller-analytics",
            description: "Track My performance",
            bgClass: "analytics",
            disabled: false
        }
    ];
    
    const handleCardClick = (path, disabled) => {
        if (!disabled) {
            navigate(path);
        }
    };
    
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Seller Dashboard</h1>
                <p>Welcome back! Manage your business from here.</p>
            </div>
            
            <div className="dashboard-grid">
                {dashboardItems.map((item, index) => (
                    <div 
                        key={index}
                        className={`dashboard-card ${item.bgClass} ${item.disabled ? 'disabled' : ''}`}
                        onClick={() => handleCardClick(item.path, item.disabled)}
                        style={item.disabled ? {
                            opacity: 0.6,
                            cursor: 'not-allowed',
                            filter: 'grayscale(50%)'
                        } : {}}
                    >
                        <div className="card-content">
                            <div className="icon-wrapper">
                                {item.icon}
                            </div>
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                            {item.disabled && (
                                <div className="coming-soon-badge">
                                    Coming Soon
                                </div>
                            )}
                            <div className="card-overlay"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardSquares;