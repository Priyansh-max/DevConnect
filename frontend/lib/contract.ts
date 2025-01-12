import { ethers } from "ethers"

const CONTRACT_ADDRESS = "0x2Be976bb6DC8Fe1C470008315501c253AFa19f44"

const CONTRACT_ABI = [
  // Events
  "event DeveloperRegistered(address indexed developer, string name, string expertise, uint256 hourlyRate)",
  "event CallBooked(address indexed developer, address indexed client, uint256 amount)",
  "event CallCompleted(uint256 callId, uint256 duration)",
  "event AvailabilityToggled(address indexed developer, bool isAvailable)",
  "event CallRequested(address indexed developer, address indexed client, uint256 requestId)",
  "event CallAccepted(address indexed developer, address indexed client, uint256 requestId)",
  "event CallRejected(address indexed developer, address indexed client, uint256 requestId)",

  // Functions
  "function registerDeveloper(string memory _name, string memory _expertise, uint256 _hourlyRate)",
  "function getDeveloperCount() view returns (uint256)",
  "function getDeveloperAddress(uint256 _index) view returns (address)",
  "function getDeveloperDetails(address _developer) view returns (string memory name, string memory expertise, uint256 hourlyRate, bool isAvailable, bool isRegistered)",
  "function bookCall(address _developer) payable",
  "function completeCall(uint256 _callId, uint256 _duration)",
  "function toggleAvailability()",
  "function developers(address) view returns (string name, string expertise, uint256 hourlyRate, bool isAvailable, bool isRegistered)",
  "function respondToCallRequest(uint256 _requestId, bool _accept)"
]

interface DevConnectContract extends ethers.BaseContract {
  registerDeveloper(name: string, expertise: string, hourlyRate: bigint): Promise<any>;
  bookCall(developerAddress: string, options: { value: bigint }): Promise<any>;
  getDeveloperCount(): Promise<number>;
  getDeveloperAddress(index: number): Promise<string>;
  getDeveloperDetails(address: string): Promise<[string, string, bigint, boolean, boolean]>;
  completeCall(callId: number, duration: number): Promise<any>;
  toggleAvailability(): Promise<any>;
  respondToCallRequest(requestId: number, accept: boolean): Promise<any>;
}

export interface Developer {
  name: string;
  expertise: string;
  hourlyRate: bigint;
  walletAddress: string;
  isAvailable: boolean;
  isRegistered: boolean;
}

export async function getContract(withSigner = false): Promise<DevConnectContract> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  ) as unknown as DevConnectContract

  if (withSigner) {
    const signer = await provider.getSigner()
    return contract.connect(signer) as unknown as DevConnectContract
  }

  return contract
}

export async function registerDeveloper(name: string, expertise: string, hourlyRate: string) {
  try {
    const contract = await getContract(true)
    const rateInWei = ethers.parseEther(hourlyRate)
    const tx = await contract.registerDeveloper(name, expertise, rateInWei)
    return tx
  } catch (error: any) {
    console.error("Contract error:", error)
    throw new Error(error.message || "Failed to register developer")
  }
}

export async function bookCall(developerAddress: string, amount: string) {
  const contract = await getContract(true)
  const tx = await contract.bookCall(developerAddress, {
    value: ethers.parseEther(amount)
  })
  return tx.wait()
}

export async function getDeveloperDetails(address: string): Promise<Developer> {
  const contract = await getContract();
  const [name, expertise, hourlyRate, isAvailable, isRegistered] = await contract.getDeveloperDetails(address);
  return {
    name,
    expertise,
    hourlyRate,
    walletAddress: address,
    isAvailable,
    isRegistered
  };
}

export async function completeCall(callId: number, duration: number) {
  const contract = await getContract(true)
  const tx = await contract.completeCall(callId, duration)
  return tx.wait()
}

export async function toggleAvailability() {
  const contract = await getContract(true)
  const tx = await contract.toggleAvailability()
  return tx.wait()
}

export async function getAllDevelopers(): Promise<Developer[]> {
  const contract = await getContract();
  try {
    const count = await contract.getDeveloperCount();
    const developers: Developer[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const address = await contract.getDeveloperAddress(i);
        const [name, expertise, hourlyRate, isAvailable, isRegistered] = 
          await contract.getDeveloperDetails(address);
        
        console.log('Raw hourlyRate:', hourlyRate.toString());
        
        developers.push({
          name,
          expertise,
          hourlyRate,
          walletAddress: address,
          isAvailable,
          isRegistered
        });
      } catch (error) {
        console.error(`Error processing developer ${i}:`, error);
        continue;
      }
    }

    return developers;
  } catch (error: any) {
    console.error("Error in getAllDevelopers:", error);
    throw new Error(error.message || "Failed to load developers");
  }
}

export async function respondToCallRequest(requestId: number, accept: boolean) {
  const contract = await getContract(true);
  const tx = await contract.respondToCallRequest(requestId, accept);
  return tx.wait();
} 