/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  makeStyles
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import {useNavigate } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  root: {},
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  }
}));

const Toolbar = ({ className, is_fiat, ...rest }) => {
  const classes = useStyles();
  const navigate = useNavigate()

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
      >
        {is_fiat ? (
          <Button
            color="primary"
            variant="contained"
            onClick={e=>{navigate('/app/crypto-investments')}}
            style={{marginRight:10}}
          >
            Crypto Investment
          </Button>
        ) : (
          <Button
            color="primary"
            variant="contained"
            onClick={e=>{navigate('/app/investments')}}
            style={{marginRight:10}}
          >
            Investment
          </Button>
        )}
        <Button
          color="primary"
          variant="contained"
          onClick={e=>{navigate('/app/add-investment')}}
        >
          Add Investment
        </Button>
      </Box>
      
    </div>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string
};

export default Toolbar;
