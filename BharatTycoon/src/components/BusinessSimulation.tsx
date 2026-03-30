import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface BusinessAction {
  id: string;
  type: 'purchase' | 'hire' | 'sell';
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface BalanceSheetEntry {
  category: string;
  items: { name: string; value: number; quantity?: number }[];
  total: number;
}

interface BusinessSimulationProps {
  businessType: string;
  cityTier: number;
  capital: number;
}

export const BusinessSimulation: React.FC<BusinessSimulationProps> = ({ 
  businessType, 
  cityTier, 
  capital 
}) => {
  const [cash, setCash] = useState(capital);
  const [month, setMonth] = useState(1);
  const [actions, setActions] = useState<BusinessAction[]>([]);
  const [balanceSheet, setBalanceSheet] = useState({
    assets: { cash: capital, inventory: 0, equipment: 0, receivables: 0 },
    liabilities: { loans: 0, payables: 0, salaries_due: 0 },
    equity: { owner_capital: capital, retained_earnings: 0 }
  });
  const [staff, setStaff] = useState<{count: number; salary: number}>({ count: 0, salary: 0 });
  const [inventory, setInventory] = useState<{quantity: number; unitCost: number}>({ quantity: 0, unitCost: 0 });
  const [equipment, setEquipment] = useState<{items: {name: string; value: number}[]}>({ items: [] });
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionAmount, setActionAmount] = useState(0);
  const [actionDetails, setActionDetails] = useState('');

  const businessConfigs: Record<string, {
    inventoryUnit: string;
    equipmentOptions: {name: string; cost: number}[];
    avgSalePrice: number;
    costPerUnit: number;
    monthlyRent: number;
  }> = {
    restaurant: {
      inventoryUnit: 'kg ingredients',
      equipmentOptions: [
        {name: 'Kitchen Equipment', cost: 50000},
        {name: 'Furniture & Tables', cost: 30000},
        {name: 'Refrigerator', cost: 25000},
        {name: 'POS System', cost: 15000}
      ],
      avgSalePrice: 300,
      costPerUnit: 120,
      monthlyRent: 20000
    },
    retail: {
      inventoryUnit: 'units',
      equipmentOptions: [
        {name: 'Shelving & Display', cost: 20000},
        {name: 'Billing System', cost: 10000},
        {name: 'Security System', cost: 15000}
      ],
      avgSalePrice: 500,
      costPerUnit: 300,
      monthlyRent: 25000
    },
    tech: {
      inventoryUnit: 'units (servers/services)',
      equipmentOptions: [
        {name: 'Computers', cost: 80000},
        {name: 'Cloud Services Setup', cost: 30000},
        {name: 'Office Furniture', cost: 25000}
      ],
      avgSalePrice: 5000,
      costPerUnit: 2000,
      monthlyRent: 15000
    },
    salon: {
      inventoryUnit: 'supplies',
      equipmentOptions: [
        {name: 'Salon Chairs', cost: 40000},
        {name: 'Mirrors & Lighting', cost: 15000},
        {name: 'Equipment Kit', cost: 25000}
      ],
      avgSalePrice: 800,
      costPerUnit: 200,
      monthlyRent: 18000
    },
    tuition: {
      inventoryUnit: 'study materials',
      equipmentOptions: [
        {name: 'Furniture', cost: 15000},
        {name: 'Projector', cost: 20000},
        {name: 'Whiteboards', cost: 5000}
      ],
      avgSalePrice: 3000,
      costPerUnit: 500,
      monthlyRent: 12000
    },
    manufacturing: {
      inventoryUnit: 'units raw materials',
      equipmentOptions: [
        {name: 'Machinery', cost: 150000},
        {name: 'Tools', cost: 30000},
        {name: 'Storage', cost: 20000}
      ],
      avgSalePrice: 2000,
      costPerUnit: 800,
      monthlyRent: 30000
    }
  };

  const config = businessConfigs[businessType] || businessConfigs.restaurant;

  const calculateNetWorth = () => {
    const totalAssets = Object.values(balanceSheet.assets).reduce((a, b) => a + b, 0);
    const totalLiabilities = Object.values(balanceSheet.liabilities).reduce((a, b) => a + b, 0);
    return totalAssets - totalLiabilities;
  };

  const calculateRetainedEarnings = () => {
    const totalRevenue = actions.filter(a => a.type === 'sell').reduce((sum, a) => sum + a.amount, 0);
    const totalExpenses = actions.filter(a => a.type !== 'sell').reduce((sum, a) => sum + a.amount, 0);
    return totalRevenue - totalExpenses;
  };

  const handlePurchase = (item: {name: string; cost: number}) => {
    if (cash < item.cost) {
      alert('Not enough cash!');
      return;
    }
    
    setCash(prev => prev - item.cost);
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'purchase',
      description: `Purchased ${item.name}`,
      amount: item.cost,
      category: item.name,
      date: `Month ${month}`
    }]);
    
    if (item.name.includes('Equipment') || item.name.includes('Computers') || item.name.includes('Machinery')) {
      setEquipment(prev => ({ items: [...prev.items, { name: item.name, value: item.cost }] }));
    }
    setShowActionModal(null);
  };

  const handleHireStaff = () => {
    const monthlySalary = cityTier === 1 ? 20000 : cityTier === 2 ? 15000 : 10000;
    const cost = monthlySalary * actionAmount;
    
    if (cash < cost) {
      alert('Not enough cash!');
      return;
    }
    
    setCash(prev => prev - cost);
    setStaff(prev => ({ 
      count: prev.count + actionAmount, 
      salary: prev.salary + monthlySalary 
    }));
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'hire',
      description: `Hired ${actionAmount} staff member(s)`,
      amount: cost,
      category: 'Salaries',
      date: `Month ${month}`
    }]);
    setShowActionModal(null);
    setActionAmount(0);
  };

  const handleBuyInventory = () => {
    const cost = actionAmount * config.costPerUnit;
    if (cash < cost) {
      alert('Not enough cash!');
      return;
    }
    
    setCash(prev => prev - cost);
    setInventory(prev => ({ 
      quantity: prev.quantity + actionAmount, 
      unitCost: config.costPerUnit 
    }));
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'purchase',
      description: `Bought ${actionAmount} ${config.inventoryUnit}`,
      amount: cost,
      category: 'Inventory',
      date: `Month ${month}`
    }]);
    setShowActionModal(null);
    setActionAmount(0);
  };

  const handleSell = () => {
    const maxSales = Math.min(inventory.quantity, Math.ceil(staff.count * 10) || 5);
    if (maxSales === 0) {
      alert('Need inventory and staff to make sales!');
      return;
    }
    
    const quantity = Math.min(actionAmount, maxSales);
    const revenue = quantity * config.avgSalePrice;
    const profit = revenue - (quantity * config.costPerUnit);
    
    setCash(prev => prev + revenue);
    setInventory(prev => ({ ...prev, quantity: prev.quantity - quantity }));
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'sell',
      description: `Sold ${quantity} units`,
      amount: revenue,
      category: 'Revenue',
      date: `Month ${month}`
    }]);
    setShowActionModal(null);
    setActionAmount(0);
  };

  const handleNextMonth = () => {
    const monthlyRent = config.monthlyRent;
    const totalSalaries = staff.salary;
    const monthlyExpenses = monthlyRent + totalSalaries + 5000;
    
    if (cash < monthlyExpenses) {
      alert('Not enough cash for monthly expenses! Game Over.');
      return;
    }
    
    setCash(prev => prev - monthlyExpenses);
    setMonth(prev => prev + 1);
    
    const sales = Math.min(inventory.quantity, Math.ceil(staff.count * 10) || 5);
    if (sales > 0) {
      const revenue = sales * config.avgSalePrice;
      const cogs = sales * config.costPerUnit;
      setCash(prev => prev + revenue);
      setInventory(prev => ({ ...prev, quantity: prev.quantity - sales }));
      setActions(prev => [...prev, {
        id: Date.now().toString(),
        type: 'sell',
        description: `Monthly sales (${sales} units)`,
        amount: revenue,
        category: 'Revenue',
        date: `Month ${month + 1}`
      }]);
    }
    
    setActions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'purchase',
      description: `Monthly rent & expenses`,
      amount: monthlyExpenses,
      category: 'Expenses',
      date: `End of Month ${month}`
    }]);
  };

  useEffect(() => {
    setBalanceSheet({
      assets: { 
        cash, 
        inventory: inventory.quantity * inventory.unitCost,
        equipment: equipment.items.reduce((sum, e) => sum + e.value, 0),
        receivables: 0
      },
      liabilities: { loans: 0, payables: 0, salaries_due: 0 },
      equity: { 
        owner_capital: capital, 
        retained_earnings: calculateRetainedEarnings() 
      }
    });
  }, [cash, inventory, equipment, actions, capital]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalAssets = Object.values(balanceSheet.assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(balanceSheet.liabilities).reduce((a, b) => a + b, 0);
  const totalEquity = Object.values(balanceSheet.equity).reduce((a, b) => a + b, 0);

  return (
    <div className="business-simulation">
      <div className="sim-header">
        <h2>Business Simulation</h2>
        <div className="sim-stats">
          <span className="month-badge">Month {month}</span>
          <span className="cash-badge">Cash: {formatCurrency(cash)}</span>
        </div>
      </div>

      <div className="sim-content">
        <div className="actions-panel">
          <h3>Business Actions</h3>
          
          <div className="action-section">
            <h4>1. Purchase Assets</h4>
            <div className="equipment-grid">
              {config.equipmentOptions.map((item, i) => (
                <button 
                  key={i} 
                  className="equipment-btn"
                  onClick={() => handlePurchase(item)}
                  disabled={cash < item.cost}
                >
                  <span>{item.name}</span>
                  <span className="cost">{formatCurrency(item.cost)}</span>
                </button>
              ))}
            </div>
            <button 
              className="action-btn secondary"
              onClick={() => setShowActionModal('buyInventory')}
            >
              Buy Inventory ({config.inventoryUnit})
            </button>
          </div>

          <div className="action-section">
            <h4>2. Hire Staff</h4>
            <p className="staff-info">
              Current: {staff.count} staff | Monthly: {formatCurrency(staff.salary)}
            </p>
            <button 
              className="action-btn"
              onClick={() => setShowActionModal('hire')}
              disabled={cash < 10000}
            >
              Hire Staff
            </button>
          </div>

          <div className="action-section">
            <h4>3. Make Sales</h4>
            <p className="inventory-info">
              Inventory: {inventory.quantity} | Price: {formatCurrency(config.avgSalePrice)}/unit
            </p>
            <button 
              className="action-btn success"
              onClick={() => setShowActionModal('sell')}
              disabled={inventory.quantity === 0 || staff.count === 0}
            >
              Record Sale
            </button>
          </div>

          <button className="next-month-btn" onClick={handleNextMonth}>
            End Month {month} → Start Month {month + 1}
          </button>
        </div>

        <div className="balance-sheet-panel">
          <h3>Balance Sheet</h3>
          
          <div className="balance-section">
            <div className="bs-column">
              <h4>Assets</h4>
              <ul>
                <li><span>Cash</span><span>{formatCurrency(balanceSheet.assets.cash)}</span></li>
                <li><span>Inventory</span><span>{formatCurrency(balanceSheet.assets.inventory)}</span></li>
                <li><span>Equipment</span><span>{formatCurrency(balanceSheet.assets.equipment)}</span></li>
                <li className="total"><span>Total Assets</span><span>{formatCurrency(totalAssets)}</span></li>
              </ul>
            </div>
            
            <div className="bs-column">
              <h4>Liabilities</h4>
              <ul>
                <li><span>Loans</span><span>{formatCurrency(balanceSheet.liabilities.loans)}</span></li>
                <li><span>Payables</span><span>{formatCurrency(balanceSheet.liabilities.payables)}</span></li>
                <li className="total"><span>Total Liabilities</span><span>{formatCurrency(totalLiabilities)}</span></li>
              </ul>
              
              <h4>Equity</h4>
              <ul>
                <li><span>Owner Capital</span><span>{formatCurrency(balanceSheet.equity.owner_capital)}</span></li>
                <li><span>Retained Earnings</span><span>{formatCurrency(balanceSheet.equity.retained_earnings)}</span></li>
                <li className="total"><span>Total Equity</span><span>{formatCurrency(totalEquity)}</span></li>
              </ul>
            </div>
          </div>

          <div className="net-worth">
            <span>Net Worth</span>
            <span className={calculateNetWorth() >= capital ? 'positive' : 'negative'}>
              {formatCurrency(calculateNetWorth())}
            </span>
          </div>
        </div>
      </div>

      <div className="action-history">
        <h4>Recent Actions</h4>
        <div className="history-list">
          {actions.slice(-5).reverse().map(action => (
            <div key={action.id} className={`history-item ${action.type}`}>
              <span className="date">{action.date}</span>
              <span className="desc">{action.description}</span>
              <span className={`amount ${action.type}`}>
                {action.type === 'sell' ? '+' : '-'}{formatCurrency(action.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showActionModal && (
        <div className="modal-overlay" onClick={() => setShowActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>
              {showActionModal === 'buyInventory' && 'Buy Inventory'}
              {showActionModal === 'hire' && 'Hire Staff'}
              {showActionModal === 'sell' && 'Record Sale'}
            </h3>
            
            <input
              type="number"
              placeholder="Enter quantity"
              value={actionAmount || ''}
              onChange={e => setActionAmount(parseInt(e.target.value) || 0)}
            />
            
            <div className="modal-preview">
              {showActionModal === 'buyInventory' && (
                <p>Cost: {formatCurrency(actionAmount * config.costPerUnit)}</p>
              )}
              {showActionModal === 'hire' && (
                <p>Monthly Salary: {formatCurrency(cityTier === 1 ? 20000 : cityTier === 2 ? 15000 : 10000)} × {actionAmount}</p>
              )}
              {showActionModal === 'sell' && (
                <p>Revenue: {formatCurrency(actionAmount * config.avgSalePrice)}</p>
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowActionModal(null)}>Cancel</button>
              <button 
                className="primary"
                onClick={() => {
                  if (showActionModal === 'buyInventory') handleBuyInventory();
                  else if (showActionModal === 'hire') handleHireStaff();
                  else if (showActionModal === 'sell') handleSell();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSimulation;
