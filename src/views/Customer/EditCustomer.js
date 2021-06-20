/* eslint-disable */
import React from 'react';
import {
  Box,
  Container,
  withStyles,
  createStyles,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Divider,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress
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
import { useParams } from "react-router-dom"

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

class CreateCustomer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
        staff_id: null,
        account_type: null,
        corporate_name: null,
        surname: null,
        first_name: null,
        other_name: null,
        gender: null,
        email: null,
        phone_number: null,
        address: null,
        date_of_birth: null,
        mode_of_identification: null,
        id_no: null,
        staffs: [],
        isLoading: false,
        isLoadingDetails: true,
    }
  }

  handleUpdateCustomer = event =>{
    if(this.state.staff_id && this.state.surname && this.state.first_name && this.state.other_name && this.state.email && this.state.gender && this.state.phone_number){
        this.props.openDialog({
            viewCtrl: "warning",
            title: "Confirm Customer Update",
            description: "Make sure you have confirmed the details before you proceed from here",
            close: dialog =>{
                if(dialog.viewCtrl == "success"){
                    this.props.navigate("/app/customers");
                }
                dialog.close()
            },
            confirm: dialog =>{
                makeRequest(this.props).post('/customer/update',qs.stringify({
                    id: this.props.params.id,
                    account_type: this.state.account_type,
                    corporate_name: this.state.corporate_name,
                    staff_id: this.state.staff_id,
                    surname: this.state.surname,
                    first_name: this.state.first_name,
                    other_name: this.state.other_name,
                    gender: this.state.gender,
                    email: this.state.email,
                    phone_number: this.state.phone_number,
                    address: this.state.address,
                    date_of_birth: this.state.date_of_birth,
                    mode_of_identification: this.state.mode_of_identification,
                    id_no: this.state.id_no,
                }))
                    .then(response => {
                        dialog.setViewCtrl("success")
                        dialog.setTitle("Customer Created!")
                        dialog.setDescription(
                            <Typography>
                                {response.data.message}
                            </Typography>
                        )
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
                    //Do nothing
                    })
            }
        })
    }
    else{
        this.props.enqueueSnackbar("All fields are required to create a new customer", {variant:'warning'});
    }
  }

  clearFields = () =>{
      this.setState({
        username: "",
        first_name: "",
        last_name: "",
        gender: "",
        email: "",
        position: "",
        password: "",
        password_verify: ""
      })
  }

  componentDidMount(){
    this.fetchCustomerDetails()
    makeRequest(this.props).post('/admin/list/all')
    .then(response => {
       this.setState({
           staffs:response.data.data.list,
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

  fetchCustomerDetails(){
    makeRequest(this.props).get('/customer/get/'+this.props.params.id)
    .then(response => {
       this.setState({
            staff_id: response.data.data.customer.staff.staff_id,
            account_type: response.data.data.customer.account_type,
            corporate_name: response.data.data.customer.corporate_name,
            surname: response.data.data.customer.surname,
            first_name: response.data.data.customer.first_name,
            other_name: response.data.data.customer.other_name,
            gender: response.data.data.customer.gender,
            email: response.data.data.customer.email,
            phone_number: response.data.data.customer.phone_number,
            address: response.data.data.customer.address,
            date_of_birth: response.data.data.customer.date_of_birth,
            mode_of_identification: response.data.data.customer.mode_of_identification,
            id_no: response.data.data.customer.id_no,
            isLoadingDetails: false,
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

  render(){
    return(
      <Page
        className={this.props.classes.root}
        title="Create Staff"
      >
        <Container maxWidth={false}>
            <Card>
                <CardHeader
                    title="Edit Customer"
                    subheader="Edit Customer Details"
                    action={<Button variant="outlined" onClick={evt=>this.clearFields()}>Clear</Button>}
                />
                <Divider/>
                <CardContent>
                    {this.state.isLoadingDetails ? (
                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={350}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                            <>
                                <Grid container spacing={2} style={{marginTop: 20}}>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Staff/Marketer"
                                            name="staff_id"
                                            value={this.state.staff_id}
                                            onChange={e => this.setState({staff_id:e.target.value})}
                                            select
                                            disabled={this.state.staffs < 1}
                                        >
                                            {
                                                this.state.staffs.map(staff=>(
                                                    <MenuItem value={staff.id}>{`${staff.first_name} ${staff.last_name}`}</MenuItem>
                                                ))
                                            }
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Account Type"
                                name="account_type"
                                value={this.state.account_type}
                                onChange={e => this.setState({account_type:e.target.value})}
                                select
                            >
                                <MenuItem value="individual">Individual</MenuItem>
                                <MenuItem value="corporate">Corporate</MenuItem>
                            </TextField>
                        </Grid>
                        {this.state.account_type == "individual" ? (
                            <>
                                <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Surname"
                                        name="surname"
                                        value={this.state.surname}
                                        onChange={e => this.setState({surname:e.target.value})}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="First Name"
                                        name="first_name"
                                        value={this.state.first_name}
                                        onChange={e => this.setState({first_name:e.target.value})}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Other Name"
                                        name="other_name"
                                        value={this.state.other_name}
                                        onChange={e => this.setState({other_name:e.target.value})}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Gender"
                                        name="gender"
                                        value={this.state.gender}
                                        onChange={e => this.setState({gender:e.target.value})}
                                        select
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                    </TextField>
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Corporate Name"
                                    name="corporate_name"
                                    value={this.state.corporate_name}
                                    onChange={e => this.setState({corporate_name:e.target.value})}
                                />
                            </Grid>
                        )}
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Email"
                                            name="email"
                                            value={this.state.email}
                                            onChange={e => this.setState({email:e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Phone Number"
                                            name="phone_number"
                                            value={this.state.phone_number}
                                            onChange={e => this.setState({phone_number:e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Address"
                                            name="address"
                                            value={this.state.address}
                                            onChange={e => this.setState({address:e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Date of Birth"
                                            name="date_of_birth"
                                            type="date"
                                            value={this.state.date_of_birth}
                                            onChange={e => this.setState({date_of_birth:e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Mode of Identification"
                                            name="mode_of_identification"
                                            value={this.state.mode_of_identification}
                                            onChange={e => this.setState({mode_of_identification:e.target.value})}
                                            select
                                        >
                                            <MenuItem value="national identity card">National Identity Card (NIMC)</MenuItem>
                                            <MenuItem value="international passport">International Passport</MenuItem>
                                            <MenuItem value="drivers license">Drivers License</MenuItem>
                                            <MenuItem value="voters card">Voters Card</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Identity No"
                                            name="id_no"
                                            value={this.state.id_no}
                                            onChange={e => this.setState({id_no:e.target.value})}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )
                    }
                </CardContent>
                <CardActions>
                   <Button disableElevation disabled={this.state.agents < 1}  variant="contained" color="primary" onClick={this.handleUpdateCustomer}>Update Customer</Button>
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
            withPermission(VIEW_PERMISSION_NAME)(withConfirmationDialog(useRouter(CreateCustomer))))));