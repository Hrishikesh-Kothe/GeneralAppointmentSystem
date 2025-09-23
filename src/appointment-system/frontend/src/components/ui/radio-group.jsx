import React from 'react';

const RadioGroup = ({ className = '', value, onValueChange, children, ...props }) => {
  const name = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  
  const handleChange = (event) => {
    const newValue = event.target.value;
    console.log('RadioGroup changing value to:', newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div
      className={`grid gap-2 ${className}`}
      {...props}
      role="radiogroup"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'div') {
          // Look for RadioGroupItem inside the div
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (grandChild) => {
              if (React.isValidElement(grandChild) && grandChild.type === RadioGroupItem) {
                return React.cloneElement(grandChild, {
                  checked: grandChild.props.value === value,
                  onChange: handleChange,
                  name: name
                });
              }
              return grandChild;
            })
          });
        }
        return child;
      })}
    </div>
  );
};

const RadioGroupItem = ({ className = '', value, checked = false, onChange, name, ...props }) => {
  console.log(`RadioGroupItem ${value} - checked:`, checked);
  
  return (
    <input
      type="radio"
      value={value}
      checked={checked}
      onChange={onChange}
      name={name}
      className={`h-4 w-4 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 ${className}`}
      {...props}
    />
  );
};

export { RadioGroup, RadioGroupItem };