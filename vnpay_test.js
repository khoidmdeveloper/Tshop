/**
 * VNPay Signature Verification Test Script
 * This replicates the VNPay hash computation to verify correctness.
 */
const crypto = require('crypto');

// Config from application.properties
const vnp_TmnCode = 'RLTPPKHE';
const vnp_HashSecret = 'OE8SXHZ96PLV0G3NL65P54QQTB5NVHQE';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:8080/api/payment/vnpay-return';

// Sample order data
const orderId = '550e8400-e29b-41d4-a716-446655440000';
const totalAmountUSD = 100; // $100
const amountVND = totalAmountUSD * 25000 * 100; // Convert to VND * 100

// Create date in Vietnam timezone (UTC+7)
const now = new Date();
const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
const createDate = vnTime.toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);
const expireDate = new Date(vnTime.getTime() + 15 * 60 * 1000).toISOString().replace(/[-T:.Z]/g, '').substring(0, 14);

const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnp_TmnCode,
    vnp_Amount: String(amountVND),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId.replace(/-/g, '').substring(0, 20),
    vnp_OrderInfo: 'Thanh toan don hang Tshop ' + orderId.substring(0, 8),
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
};

const sortedKeys = Object.keys(params).sort();

console.log('=== Method 1: PHP urlencode pattern (key+value encoded, spaces as +) ===');
let hashData1 = '';
let query1 = '';
let first = true;
for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== '') {
        const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
        if (!first) {
            hashData1 += '&';
            query1 += '&';
        }
        hashData1 += encodedKey + '=' + encodedValue;
        query1 += encodedKey + '=' + encodedValue;
        first = false;
    }
}
const hash1 = crypto.createHmac('sha512', vnp_HashSecret).update(hashData1).digest('hex');
console.log('hashData:', hashData1);
console.log('hash:', hash1);
console.log('URL:', vnp_Url + '?' + query1 + '&vnp_SecureHash=' + hash1);
console.log();

console.log('=== Method 2: Java pattern (key raw, value encoded, spaces as +) ===');
let hashData2 = '';
first = true;
for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== '') {
        const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
        if (!first) {
            hashData2 += '&';
        }
        hashData2 += key + '=' + encodedValue;
        first = false;
    }
}
const hash2 = crypto.createHmac('sha512', vnp_HashSecret).update(hashData2).digest('hex');
console.log('hashData:', hashData2);
console.log('hash:', hash2);
console.log();

console.log('=== Method 3: Spaces as %20 ===');
let hashData3 = '';
first = true;
for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== '') {
        const encodedValue = encodeURIComponent(value);
        if (!first) {
            hashData3 += '&';
        }
        hashData3 += key + '=' + encodedValue;
        first = false;
    }
}
const hash3 = crypto.createHmac('sha512', vnp_HashSecret).update(hashData3).digest('hex');
console.log('hashData:', hashData3);
console.log('hash:', hash3);
console.log();
