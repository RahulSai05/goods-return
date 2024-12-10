import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuItems = ["Home", "Services", "About Us", "Contact"];

  return (
    <>
      <AppBar sx={{ backgroundColor: "transparent", color: "#000" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontSize: 50,
              fontWeight: 700,
              color: "#ffffff",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Auditly
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {menuItems.map((item) => (
              <Button
                key={item}
                onClick={() => {
                  if (item === "Home") {
                    navigate("/");
                  }
                }}
                sx={{ fontSize: 16, fontWeight: 500, color: "#ffffff" }}
              >
                {item}
              </Button>
            ))}
          </Box>
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "#fff" }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 300,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 300,
            padding: "20px",
            backgroundColor: "#fff",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{ fontSize: 24, fontWeight: 700, color: "#ffffff" }}
            onClick={() => navigate("/")}
          >
            Auditly
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon sx={{ color: "#242582" }} />
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item}
              onClick={() => {
                if (item === "Home") {
                  navigate("/");
                  setDrawerOpen(false);
                }
              }}
            >
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
