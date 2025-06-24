import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {
    Box, Typography, TextField, Button, Card, CardContent, Grid, Paper, Checkbox, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, InputLabel, FormControl, Alert
} from "@mui/material";
import {
    getProduct,
} from "../../../api/controller/admin_controller/product_controller";
import { createQuotation } from "../../../api/controller/admin_controller/opportunity_controller";
import {
    getProspectDetails,
} from "../../../api/controller/admin_controller/prospect_controller";

export default function POSManagementForm() {
    const userID = localStorage.getItem("userId");
    const { id } = useParams();
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        prospect_id : id,
        isApproved: false,
        created_by: userID,
        approved_by: userID,
        status: '1',
        total_amount: '',
        note: '',
        payment_terms: 'https://hrmfahim.biswasandbrothers.com/',
        tax: '',
        discount: '',
    });

    const [items, setItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [prospect, setProspect] = useState({});
    const [newItem, setNewItem] = useState({ product_id: '', quantity: '', unit_price: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem({
            ...newItem,
            [name]: value,
        });
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const selectedProduct = products.find(product => product.id === productId);
        setNewItem({
            ...newItem,
            product_id: productId,
            unit_price: selectedProduct ? selectedProduct.price : '',
        });
    };

    const addItem = () => {
        if (newItem.product_id && newItem.quantity && newItem.unit_price) {
            setItems([...items, { ...newItem, total: newItem.quantity * newItem.unit_price }]);
            setNewItem({ product_id: '', quantity: '', unit_price: '' });
        }
    };

    const removeItem = (index) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
    };

    const calculateTotalAmount = () => {
        return items.reduce((total, item) => total + item.total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalAmount = calculateTotalAmount();
        const code = prospect.prospect_name ? prospect.prospect_name.replace(/\s+/g, '') : '';
        const reference_no = prospect.prospect_name ? prospect.prospect_name.replace(/\s+/g, '') : '';

        const res = await createQuotation({
            ...formData,
            code,
            reference_no,
            total_amount: totalAmount
        });

        if (res.status === 'success') {
            setSuccessMessage('Quotation created successfully!');
            setFormData({
                prospect_id : id,
                isApproved: false,
                created_by: userID,
                approved_by: userID,
                status: '1',
                total_amount: '',
                note: '',
                payment_terms: 'https://hrmfahim.biswasandbrothers.com/',
                tax: '',
                discount: '',
            });
            setItems([]);
        }
    };

    const getAllProduct = async () => {
        const resProduct = await getProduct();
        setProducts(resProduct.data);
    };

    const getProspectDetail = async () => {
        const resProspect = await getProspectDetails(id);
        setProspect(resProspect.data);
    };

    useEffect(() => {
        getAllProduct();
        getProspectDetail();
    }, []);

    return (
        <Card sx={{ maxWidth: 900, mx: 'auto', p: 3, boxShadow: 3, mt: 5 }}>
            <CardContent>
                <Typography variant="h4" gutterBottom align="center">
                    Create Quotation for {prospect.prospect_name}
                </Typography>
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        
                       
                       
                     
                        
                        <Grid item xs={12}>
                            <TextField fullWidth label="Note" name="note" multiline rows={4} value={formData.note} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Payment Terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Tax" name="tax" value={formData.tax} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Discount" name="discount" value={formData.discount} onChange={handleChange} />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Items</Typography>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Unit Price</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{products.find(product => product.id === item.product_id)?.product_name}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.unit_price}</TableCell>
                                                <TableCell>{item.total}</TableCell>
                                                <TableCell>
                                                    <Button variant="contained" color="secondary" onClick={() => removeItem(index)}>Remove</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell>
                                                <FormControl fullWidth>
                                                    <InputLabel id="product-label">Product</InputLabel>
                                                    <Select
                                                        labelId="product-label"
                                                        id="product"
                                                        name="product_id"
                                                        value={newItem.product_id}
                                                        label="Product"
                                                        onChange={handleProductChange}
                                                    >
                                                        {products.map((product) => (
                                                            <MenuItem key={product.id} value={product.id}>{product.product_name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <TextField name="quantity" label="Quantity" value={newItem.quantity} onChange={handleItemChange} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField name="unit_price" label="Unit Price" value={newItem.unit_price} onChange={handleItemChange} />
                                            </TableCell>
                                            <TableCell>
                                                {newItem.quantity && newItem.unit_price ? newItem.quantity * newItem.unit_price : ''}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" color="primary" onClick={addItem}>Add Item</Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>Submit Quotation</Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
}
