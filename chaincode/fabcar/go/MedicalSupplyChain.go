
package main

import (
	"bytes"
	"encoding/json"
	"time"
	"fmt"
	"strconv"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	sc "github.com/hyperledger/fabric-protos-go/peer"
)

//Product Structure
type Product struct {
	ProductID         string   `json:"Product_Id"`
	Label              string   `json:"Label"`
	ManufacturingDate string   `json:"Manufacturing_Date"`
	ExpirationDate    string   `json:"Expiration_Date"`
	Manufacturer      string   `json:"Manufacturer"`
	OwnersList           []string `json:"Owners_List"`
}

//Order Structure
type Order struct {
	OrderID     string    `json:"Order_ID"`
	ProductID      string    `json:"Product_Id"`
	DateOfdelivery string    `json:"Date_Of_delivery"`
	//Timestamp      time.Time `json:"Timestamp"`
	Sended         bool      `json:"Sended"`
	Accepted       bool      `json:"Accepted"`
}


type SmartContract struct {
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting SmartContract: %s", err)
	}
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
	id := "1"
	ownersList := []string{}
	var product1 = Product{ProductID: id, Label: "Advil" , ManufacturingDate: "27/06/2022", ExpirationDate: "05/01/2024", Manufacturer: "Advanz Pharma", OwnersList: ownersList}
	
	ProductAsBytes, _ := json.Marshal(product1)
	err := APIstub.PutState(id, ProductAsBytes)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	return shim.Success(ProductAsBytes)
}


func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) sc.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "CreateProduct" { 
		return s.CreateProduct(stub, args)
	} else if function == "GetProduct" { 
		return s.GetProduct(stub, args)
	} else if function == "GetOrder" { 
			return s.GetOrder(stub, args)	
	} else if function == "SendOrder" { 
		return s.SendOrder(stub, args)
	} else if function == "CreateOrder" { 
		return s.CreateOrder(stub, args)
	} else if function == "AcceptOrder" {
		return s.AcceptOrder(stub, args)
	} else if function == "getHistoryOfOrders" {
		return s.getHistoryofOrders(stub, args)
	}

	fmt.Println("invoke did not find func: " + function) 
	return shim.Error("Received unknown function invocation")
}

func (s *SmartContract) CreateProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	
	mspid, _ := CallerCN(stub)
	if mspid != "Org1MSP" {

		return shim.Error("You are not authorized to do this operation")
	}
	
	owners := []string{}
	owners = append(owners, args[4])

	var product = Product{ProductID: args[0],
		ManufacturingDate: args[2],
		ExpirationDate:    args[3],
		Label:              args[1],
		Manufacturer:      args[4],
		OwnersList:           owners,
	}
	ProductAsBytes, _ := json.Marshal(product)
	errr := stub.PutState(product.ProductID, ProductAsBytes)
	if errr != nil {
		fmt.Printf("Error creating new Product: %s", errr)
	}

	return shim.Success(ProductAsBytes)
}


func (s *SmartContract) CreateOrder(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	mspid, _ := CallerCN(stub)
	if mspid != "Org1MSP" {
		return shim.Error("You are not authorized to do this operation")
	}

	var order = Order{
		OrderID: args[0],
		ProductID: args[1],
		DateOfdelivery: args[2],
		Sended:         false,
		Accepted:       false,
	}

	OrderAsBytes, _ := json.Marshal(order)
	errr := stub.PutState(order.OrderID, OrderAsBytes)
	if errr != nil {
		fmt.Printf("Error creating new Order: %s", errr)
	}
	return shim.Success(OrderAsBytes)
}

func (s *SmartContract) GetProduct(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	var id string
	id = args[0]

	ProductAsbytes, err := stub.GetState(id)

	if err != nil {
		return shim.Error("Failed to get Product:" + err.Error())
	}

	return shim.Success(ProductAsbytes)
}



func (s *SmartContract) GetOrder(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	var id string
	id = args[0]

	OrderAsbytes, err := stub.GetState(id)

	if err != nil {
		return shim.Error("Failed to get Order:" + err.Error())
	}

	return shim.Success(OrderAsbytes)
}

func (s *SmartContract) SendOrder(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	mspid, _ := CallerCN(stub)
	if (mspid == "Org4MSP") || (mspid == "Org5MSP") {

		return shim.Error("You are not authorized to do this operation")
	}

	var id string
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments ")
	}

	id = args[0]
	order, err := getOrder(stub, id)

	if err != nil {
		fmt.Printf("Error getting order: %s", err)
	}
	order.Sended = true
	order.Accepted = false
	OrderAsbytes, _ := json.Marshal(order)
	stub.PutState(order.OrderID, OrderAsbytes)
	return shim.Success(OrderAsbytes)
}

func (s *SmartContract) AcceptOrder(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	var id string
	id = args[0]
	order, err := getOrder(stub, id)
	if err != nil {
		fmt.Printf("Error getting Order(: %s", err)
	}
	product, err := getProduct(stub, order.ProductID)
	if err != nil {
		fmt.Printf("Error getting product: %s", err)
	}
	
	order.Accepted = true
	order.Sended = false
	OrderAsbytes, _ := json.Marshal(order)
	stub.PutState(order.OrderID, OrderAsbytes)
	mspid, _ := CallerCN(stub)
	product.OwnersList = append(product.OwnersList,mspid)
	ProductAsbytes, _ := json.Marshal(product)
	stub.PutState(product.ProductID, ProductAsbytes)
	return shim.Success(OrderAsbytes)
}


func (s *SmartContract) getHistoryofOrders(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	OrderID := args[0]

	fmt.Printf("- start getHistoryofOrders: %s\n", OrderID)

	resultsIterator, err := stub.GetHistoryForKey(OrderID)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryofOrders returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
