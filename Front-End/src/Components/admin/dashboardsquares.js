import React from 'react';
import { useNavigate } from "react-router-dom";
import { Users, Store, UserCog, ShieldCheck, MessageSquare, LineChart } from "lucide-react";
import '../../css/admin/admindashboard.css';

const DashboardSquares = () => {
    const navigate = useNavigate();

    const dashboardItems = [
        {
            title: "Manage Sellers",
            icon: <Users className="dashboard-icon" />,
            path: "/seller-requests",
            description: "Review and manage seller applications",
            bgClass: "manage-sellers",
            disabled: false
        },
        {
            title: "Manage Stores",
            icon: <Store className="dashboard-icon" />,
            path: "/manage-stores",
            description: "Monitor and control store operations",
            bgClass: "manage-stores",
            disabled: false
        },
        {
            title: "Manage Users",
            icon: <UserCog className="dashboard-icon" />,
            path: "/manage-users",
            description: "User account administration (Coming Soon)",
            bgClass: "manage-users",
            disabled: true
        },
        {
            title: "Customers",
            icon: <ShieldCheck className="dashboard-icon" />,
            path: "/customers",
            description: "Customer support and oversight (Coming Soon)",
            bgClass: "customers",
            disabled: true
        },
        {
            title: "Messages",
            icon: <MessageSquare className="dashboard-icon" />,
            path: "/messages",
            description: "Communication management (Coming Soon)",
            bgClass: "messages",
            disabled: true
        },
        {
            title: "Analytics",
            icon: <LineChart className="dashboard-icon" />,
            path: "/analytics",
            description: "Platform performance metrics (Coming Soon)",
            bgClass: "analytics",
            disabled: true
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
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Monitor and manage your platform from here.</p>
            </div>
            
            <div className="dashboard-grid">
                {dashboardItems.map((item, index) => (
                    <div 
                        key={index}
                        className={`dashboard-card ${item.bgClass} ${item.disabled ? 'disabled' : ''}`}
                        onClick={() => handleCardClick(item.path, item.disabled)}
                        style={{ 
                            '--animation-order': index,
                            ...(item.disabled ? {
                                opacity: 0.6,
                                cursor: 'not-allowed',
                                filter: 'grayscale(50%)'
                            } : {})
                        }}
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