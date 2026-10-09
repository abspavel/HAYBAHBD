import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isCurrentUserAdmin } from '../services/supabaseService';
import { AdminLayout, AdminTab } from './components/AdminLayout';
import { AdminLogin } from './views/AdminLogin';
import { DashboardView } from './views/DashboardView';
import { BannersView } from './views/BannersView';
import { CategoriesView } from './views/CategoriesView';
import { ProductsView } from './views/ProductsView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { CouponsView } from './views/CouponsView';
import { IncompleteOrdersView } from './views/IncompleteOrdersView';
import { SettingsView } from './views/SettingsView';
import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';
import { OrderDetails } from '../types';

export const AdminRoot: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('haybah_admin_authenticated') === 'true';
  });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [inspectingOrder, setInspectingOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const isAdmin = await isCurrentUserAdmin();
          if (isAdmin) {
            setIsAuthenticated(true);
            localStorage.setItem('haybah_admin_authenticated', 'true');
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    }

    verifyAuth();

    // Listen to Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const isAdmin = await isCurrentUserAdmin();
        if (isAdmin) {
          setIsAuthenticated(true);
          localStorage.setItem('haybah_admin_authenticated', 'true');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('haybah_admin_authenticated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem('haybah_admin_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onViewOrder={(order) => setInspectingOrder(order)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'banners':
        return <BannersView />;
      case 'categories':
        return <CategoriesView />;
      case 'products':
        return <ProductsView />;
      case 'orders':
        return <OrdersView onSelectOrder={(order) => setInspectingOrder(order)} />;
      case 'customers':
        return <CustomersView />;
      case 'coupons':
        return <CouponsView />;
      case 'incomplete':
        return (
          <IncompleteOrdersView
            onOrderCreated={() => {
              setActiveTab('orders');
            }}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onViewOrder={(order) => setInspectingOrder(order)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
      >
        {renderActiveModule()}
      </AdminLayout>

      {/* Floating Order Details Drawer */}
      <OrderDetailsDrawer
        order={inspectingOrder}
        isOpen={Boolean(inspectingOrder)}
        onClose={() => setInspectingOrder(null)}
      />
    </>
  );
};
