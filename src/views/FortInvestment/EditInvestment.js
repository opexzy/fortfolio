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

class AddInvestment extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            amount: "",
            rate: "",
            interest: "",
            total_amount: "",
            investment_date: "",
            maturity_date: "",
            asset_company: "",
            isLoading: false,
        }
    }

    componentDidMount(){
        makeRequest(this.props).get('/ca-investment/get/'+this.props.params.id)
            .then(response => {
            this.setState({
                    id: response.data.data.investment.id,
                    asset_company: response.data.data.investment.asset_company,
                    amount: response.data.data.investment.amount,
                    rate: response.data.data.investment.rate,
                    interest: response.data.data.investment.interest,
                    total_amount: response.data.data.investment.total_amount,
                    investment_date: response.data.data.investment.investment_date,
                    maturity_date: response.data.data.investment.maturity_date,
                })
            })
            .catch(error => {
                handleError({
                    error: error,
                    callbacks: {
                    400: response=>{ this.props.enqueueSnackbar(response.data.message, {variant: "error"}); }
                    }
                }, this.props);
            })
            .finally(() => {
                //Do nothing
            })
    }

    handleCreate = (event) =>{
        this.props.openDialog({
            viewCtrl: "warning",
            title: "Confirm Investment Update",
            description: "Make sure you have confirmed the details before you proceed from here",
            close: dialog =>{
                if(dialog.viewCtrl == "success"){
                    this.props.navigate("/app/ca-investments");
                }
                dialog.close()
            },
            confirm: dialog =>{
                makeRequest(this.props).post('/ca-investment/update/'+this.props.params.id, qs.stringify(this.state))
                    .then(response => {
                        dialog.setViewCtrl("success")
                        dialog.setTitle("Investment Record Updated!")
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
        let initial = {
            amount: this.state.amount,
            interest: this.state.interest,
        }
        initial[event.target.name] = event.target.value
        if((event.target.name == 'amount') || (event.target.name == 'interest')){
            this.setState({total_amount: parseInt(initial.amount)+parseInt(initial.interest)})
        }
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
                    title="Create Investments" 
                    subheader="Create and manage Credit Alert Investment"
                />
                <Divider/>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="asset_company"
                                label="Title/Asset Management Company"
                                value={this.state.asset_company}
                                onChange={e=>(this.setState({asset_company:e.target.value}))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="amount"
                                label="amount"
                                value={this.state.amount}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="rate"
                                label="Rate"
                                value={this.state.rate}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="interest"
                                label="Interest on Capital"
                                value={this.state.interest}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                disabled
                                variant="outlined"
                                name="total_amount"
                                label="Total Amount"
                                value={this.state.total_amount}
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="investment_date"
                                label="Investment Date"
                                value={this.state.investment_date}
                                type="date"
                                onChange={this.onChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                name="maturity_date"
                                label="Maturity Date"
                                value={this.state.maturity_date}
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
                                disabled={!(this.state.amount && this.state.rate && this.state.interest && this.state.investment_date && this.state.maturity_date)}
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
            withPermission(VIEW_PERMISSION_NAME)(withConfirmationDialog(useRouter(AddInvestment))))));