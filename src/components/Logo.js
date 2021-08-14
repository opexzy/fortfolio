import React from 'react';
import Avatar from '@material-ui/core/Avatar'

const Logo = (props) => {
  return (
    <Avatar
      alt="Logo"
      src="/credit-alert.png"
      style={{width:50, height:50, background:"#fff"}}
      variant="circle"
      {...props}
    />
  );
};

export default Logo;
