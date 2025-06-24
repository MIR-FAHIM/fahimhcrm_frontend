import React, { useState } from 'react';
import '../product_strategy_list/strategy_list.css'
const StrategyList = ({ strategy }) => {
  const [strategyList, setStrategyList] = useState(strategy);

  // Toggle active status of the strategy
  const handleActiveToggle = (id) => {
    setStrategyList((prevStrategies) =>
      prevStrategies.map((strategy) =>
        strategy.id === id
          ? { ...strategy, is_active: strategy.is_active === 1 ? 0 : 1 }
          : strategy
      )
    );
  };

  // Toggle important status of the strategy
  const handleImportantToggle = (id) => {
    setStrategyList((prevStrategies) =>
      prevStrategies.map((strategy) =>
        strategy.id === id
          ? { ...strategy, is_important: strategy.is_important === 1 ? 0 : 1 }
          : strategy
      )
    );
  };

  // Delete a strategy
  const handleDelete = (id) => {
    setStrategyList((prevStrategies) => prevStrategies.filter((strategy) => strategy.id !== id));
  };

  return (
    <div className="strategy-list">
      <h1>Strategy List</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Is Active</th>
            <th>Is Important</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {strategyList.map((strategy) => (
            <tr key={strategy.id}>
              <td>{strategy.strategy_title}</td>
              <td>
                <input
                  type="checkbox"
                  checked={strategy.is_active === 1}
                  onChange={() => handleActiveToggle(strategy.id)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={strategy.is_important === 1}
                  onChange={() => handleImportantToggle(strategy.id)}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(strategy.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StrategyList;
