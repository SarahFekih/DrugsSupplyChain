package main

import (
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"

	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-chaincode-go/shim"
)

func getProduct(APIstub shim.ChaincodeStubInterface, id string) (Product, error) {
	var product Product
	ProductAsBytes, err := APIstub.GetState(id)
	json.Unmarshal(ProductAsBytes, &product)

	if err != nil {
		return product, errors.New("Failed to find product - " + id)
	}

	return product, nil
}

func getOrder(APIstub shim.ChaincodeStubInterface, id string) (Order, error) {
	var order Order
	OrderAsBytes, err := APIstub.GetState(id)
	json.Unmarshal(OrderAsBytes, &order)

	if err != nil {
		return order, errors.New("Failed to find order - " + id)
	}

	return order, nil
}

func parsePEM(certPEM string) (*x509.Certificate, error) {
	block, _ := pem.Decode([]byte(certPEM))
	if block == nil {
		return nil, errors.New("Failed to parse PEM certificate")
	}

	return x509.ParseCertificate(block.Bytes)
}

// extracts CN from an x509 certificate
func CNFromX509(certPEM string) (string, error) {
	cert, err := parsePEM(certPEM)
	if err != nil {
		return "", errors.New("Failed to parse certificate: " + err.Error())
	}
	return cert.Subject.CommonName, nil
}

// extracts CN from caller of a chaincode function
func CallerCN(APIstub shim.ChaincodeStubInterface) (string, error) {

	// get the MSP ID of the client's identity
	mspid, _ := cid.GetMSPID(APIstub)

	return mspid, nil
}