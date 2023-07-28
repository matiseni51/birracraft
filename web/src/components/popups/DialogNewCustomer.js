import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { API_DATA_CALL } from "../../utils/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogNewCustomer(props) {
  const [type, setType] = React.useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    return await API_DATA_CALL("POST", "/customer/", {
      name: data.get("name"),
      email: data.get("email"),
      cellphone: data.get("phone"),
      address: data.get("address"),
      type: data.get("type"),
    }).then((response) => {
      if (response.pk) {
        window.location.reload();
      } else {
        navigate("/RegistrationFail");
      }
    });
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle>Create New Customer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a new client to start assigned Orders.
          </DialogContentText>
          <Grid container>
            <Grid item sx={{ ml: 5 }}>
              <TextField
                margin="dense"
                id="name"
                name="name"
                label="Name"
                type="text"
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ ml: 5 }}>
              <TextField
                margin="dense"
                id="email"
                name="email"
                label="Email Address"
                type="email"
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ ml: 5 }}>
              <TextField
                margin="dense"
                id="phone"
                name="phone"
                label="Phone Number"
                type="text"
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ ml: 5 }}>
              <TextField
                margin="dense"
                id="address"
                name="address"
                label="Address"
                type="text"
                variant="standard"
              />
            </Grid>
          </Grid>
          <Grid container justifyContent="center">
            <FormControl sx={{ width: "80%", mt: 3 }}>
              <InputLabel>Type</InputLabel>
              <Select
                id="type"
                name="type"
                label="Type"
                variant="standard"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                <MenuItem value="Particular">Particular</MenuItem>
                <MenuItem value="Comerce">Comerce</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
