import React from 'react';
import PropTypes from 'prop-types';

const CustomTooltip = ({ active, payload, label, percentages }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
          <h4>{label}</h4>
          {payload.map((entry, index) => (
            <div key={`item-${index}`}>
              <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value} ({percentages[entry.name].toFixed(2)}%)
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // PropTypes for CustomTooltip
  CustomTooltip.propTypes = {
    active: PropTypes.bool.isRequired,
    payload: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    percentages: PropTypes.object.isRequired,
  };

  
export default CustomTooltip;