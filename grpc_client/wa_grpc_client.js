import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import config from '../app/config/config.js';
import { join } from 'node:path';

const __dirname = import.meta.dirname;

const PROTO_PATH = join(__dirname + '/../proto/wa_grpc_service.proto');

// Load the package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const WAService = grpc.loadPackageDefinition(packageDefinition).WAService;

const waGrpcClient = new WAService(
  config.WA_GRPC_SERVER_ADDRESS,
  grpc.credentials.createInsecure(), // Use insecure credentials for plaintext communication
);

export default waGrpcClient;

/**
 * Sends an OTP message via wa service.
 *
 * @param {Object} requestPayload - The request payload.
 * @param {Object} requestPayload.data - The OTP message data.
 * @param {string} requestPayload.data.service_name - Name of the service sending the OTP.
 * @param {string} requestPayload.data.phone_number - Phone number to send OTP.
 * @param {string} requestPayload.data.otp_code - The OTP code.
 * @returns {Promise<Object>} - The gRPC response.
 * @throws {Error} - If an error occurs during the gRPC request.
 */
export const sendOtpMessage = async (requestPayload) => {
  return new Promise((resolve, reject) => {
    waGrpcClient.SendOtpMessage(requestPayload, (error, response) => {
      if (error) {
        reject(new Error(`gRPC Error: ${error.message}`));
      } else {
        resolve(response);
      }
    });
  });
};
