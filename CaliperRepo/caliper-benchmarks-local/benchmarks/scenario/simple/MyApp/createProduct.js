'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class CreateCarWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.txIndex = 0;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        this.txIndex++;
        let ProductID = 'avsd';
        let Label = 'avsd';
        let ManufacturingDate = 'avsd';
        let ExpirationDate = 'avsd';
        let Manufacturer = 'avsd';

        let args = {
            contractId: 'fabcar',
            contractVersion: 'v1',
            contractFunction: 'CreateProduct',
            contractArguments: [ProductID, Label, ManufacturingDate, ExpirationDate, Manufacturer],
            timeout: 100
        };

        await this.sutAdapter.sendRequests(args);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new CreateCarWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;