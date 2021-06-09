/* eslint-disable */
import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  colors,
  makeStyles
} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import MoneyIcon from '@material-ui/icons/Money';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.red[600],
    height: 40,
    width: 40
  },
  differenceIcon: {
    color: colors.red[900]
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1)
  }
}));

const Budget = ({ className, title, value, extra, is_fiat, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
          spacing={3}
        >
          <Grid item>
            <Typography
              color="textSecondary"
              variant="caption"
              style={{textTransform:"uppercase", fontSize:10}}
            >
              {title}
            </Typography>
            {is_fiat ? (
              <Typography
                color="textPrimary"
                variant="h4"
                style={{paddingTop:15, fontSize:12}}
              >
                &#8358;{value}
              </Typography>
            ) : (
              <Typography
                color="textPrimary"
                variant="h4"
                style={{paddingTop:15, fontSize:12}}
              >
                ${value}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Avatar className={classes.avatar}>
              {(extra || extra >= 0) ? (
                <p style={{fontSize:10}}>{extra}</p>
              ) : (
                <MoneyIcon />
              )}
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Budget.propTypes = {
  className: PropTypes.string
};

export default Budget;
