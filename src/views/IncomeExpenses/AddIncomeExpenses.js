/* eslint-disable */
import React from 'react';
import {
    Avatar,
    Box, 
    Button, 
    Card, 
    CardActions, 
    CardContent, 
    CardHeader, 
    Container,
    createStyles, 
    Divider, 
    TextField, 
    withStyles,
    AppBar,
    Typography,
    IconButton,
    Grid,
    TableRow,
    TableCell,
    MenuItem,
    CircularProgress,
    FormControlLabel,
    Switch
} from '@material-ui/core';
import Page from 'src/components/Page';
import Toolbar from './Toolbar';
import { connect } from 'react-redux'
import {withSnackbar} from 'notistack'
import { setUser } from 'src/actions'
import withConfirmationDialog from 'src/utils/confirmationDialog'
import { uniqueId } from 'lodash';
import {makeRequest, handleError} from 'src/utils/axios-helper';
import { withPermission, useRouter } from 'src/utils';
import qs from 'qs'
import { Add, Remove } from '@material-ui/icons';
import moment from 'moment';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  productCard: {
    height: '100%'
  }
}));

const VIEW_PERMISSION_NAME = [];

class AddIncomeExpense extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            title: null,
            type: null,
            amount: "",
            date_made: null,
            isLoading: false,
        }
    }

    handleCreate = (event) =>{
        this.props.openDialog({
            viewCtrl: "warning",
            title: "Confirm New Record",
            description: "Make sure you have confirmed the details before you proceed from here",
            close: dialog =>{
                if(dialog.viewCtrl == "success"){
                    this.props.navigate("/app/income-expenses");
                }
                dialog.close()
            },
            confirm: dialog =>{
                makeRequest(this.props).post('/income-expenses/add', qs.stringify(this.state))
                    .then(response => {
                        dialog.setViewCtrl("success")
                        dialog.setTitle("Done!")
                        dialog.setDescription(
                            <Typography>
                                {response.data.message}
                            </Typography>
                        )
                        this.props.enqueueSnackbar(response.data.message, {variant: "success"}); 
                    })
                    .catch(error => {
                        handleError({
                            error: error,
                            callbacks: {
                                400: response=>{
                                    this.props.enqueueSnackbar(response.data.message, {variant: "error"});
                                    dialog.setViewCtrl("")
                                }
                            }
                        }, this.props);
                    })
                    .finally(() => {
                        //do nothing
                        this.setState({isLoading:false});
                    })
            }
        })
        
    }


    onChange = (event)=>{
        this.setState({[event.target.name]: event.target.value})
    }

  render(){
    return(
        <Page
        title="Add Investment"
        className={this.props.classes.root}
    >
        <Container 
            maxWidth={false}
            className={this.props.classes.container}
        >
           <Card>
               <CardHeader 
                    title="And Income/Expenses Record" 
                    subheader="Create and manage Income/Expense"
                />
                <Divider/>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="title"
                                label="Title"
                                value={this.state.title}
                                onChange={e=>(this.setState({title:e.target.value}))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="type"
                                label="Type"
                                value={this.state.type}
                                onChange={e=>(this.setState({type:e.target.value}))}
                                select
                            >
                                <MenuItem value="income">Income</MenuItem>
                                <MenuItem value="expense">Expense</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="amount"
                                label="Amount"
                                value={this.state.amount}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="date_made"
                                label="Date Made"
                                value={this.state.date_made}
                                type="date"
                                onChange={this.onChange}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    {
                        this.state.isLoading ? (
                            <CircularProgress size={22} />
                        ) : (
                            <Button 
                                onClick={this.handleCreate} 
                                variant="contained" 
                                color="primary" 
                                disableElevation
                                disabled={!(this.state.amount && this.state.title && this.state.type && this.state.date_made)}
                            >
                                Save
                            </Button>
                        )
                    }
                </CardActions>
           </Card>
        </Container>
    </Page>
    )
  }
}

const mapStateToProps = (state) => ({
  session_token: state.session_token,
})
export default connect(mapStateToProps)(
    withSnackbar(
        withStyles(useStyles)(
            withPermission(VIEW_PERMISSION_NAME)(withConfirmationDialog(useRouter(AddIncomeExpense))))));