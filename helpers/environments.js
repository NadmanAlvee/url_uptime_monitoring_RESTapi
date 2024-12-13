/*
 * Title: Environments
 * Description: Environments Function
 * Author: Nadman Alvee
 * Date: 11/20/2024
*/

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'abcde',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        toPhone: '',    

    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'fghij',
    maxChecks: 5
};

// determine the environment
const currentEnvironment = typeof(process.env.NODE_ENV) ==='string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const envToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = envToExport;