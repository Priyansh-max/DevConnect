import { ethers } from "ethers"
import DevConnectABI from "@/artifacts/contracts/DevConnect.sol/DevConnect.json"

interface DevConnectContract extends ethers.BaseContract {
  registerDeveloper(name: string, expertise: string, hourlyRate: bigint): Promise<any>;
  bookCall(developerAddress: string, options: { value: bigint }): Promise<any>;
  getDeveloperCount(): Promise<number>;
  getDeveloperAddress(index: number): Promise<string>;
  getDeveloperDetails(address: string): Promise<[string, string, bigint, boolean, boolean]>;
  isDeveloper(address: string): Promise<boolean>;
  completeCall(callId: number, duration: number): Promise<any>;
  toggleAvailability(): Promise<any>;
}

const CONTRACT_ADDRESS = "0xcc44263A5bc5EdABDcC6734bf7f10E01e0Ffd51C"

export interface Developer {
  name: string;
  expertise: string;
  hourlyRate: bigint;
  walletAddress: string;
  isAvailable: boolean;
}

export async function getContract(withSigner = false): Promise<DevConnectContract> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    DevConnectABI.abi,
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
    console.log("Contract instance created")
    
    const rateInWei = ethers.parseEther(hourlyRate)
    console.log("Rate in Wei:", rateInWei.toString())
    
    const tx = await contract.registerDeveloper(name, expertise, rateInWei)
    console.log("Transaction sent:", tx.hash)
    
    const receipt = await tx.wait()
    console.log("Transaction confirmed:", receipt)
    return receipt
  } catch (error) {
    console.error("Error in registerDeveloper:", error)
    throw error
  }
}

export async function bookCall(developerAddress: string, amount: string) {
  const contract = await getContract(true)
  const tx = await contract.bookCall(developerAddress, {
    value: ethers.parseEther(amount)
  })
  return tx.wait()
}

export async function getDeveloperDetails(address: string) {
  const contract = await getContract();
  const [name, expertise, hourlyRate, isAvailable, isRegistered] = await contract.getDeveloperDetails(address);
  return {
    name,
    expertise,
    hourlyRate,
    walletAddress: address,
    isAvailable
  } as Developer;
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
    console.log("Using contract:", CONTRACT_ADDRESS);

    const count = await contract.getDeveloperCount();
    console.log("Total developers count:", count.toString());
    const developers: Developer[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const address = await contract.getDeveloperAddress(i);
        console.log(`Checking developer ${i}:`, address);

        const isRegistered = await contract.isDeveloper(address);
        console.log(`Is registered:`, isRegistered);
        
        if (isRegistered) {
          const details = await contract.getDeveloperDetails(address);
          console.log(`Developer details:`, details);
          
          const [name, expertise, hourlyRate, isAvailable] = details;
          console.log(`Parsed details:`, { name, expertise, hourlyRate: hourlyRate.toString(), isAvailable });
          
          if (isAvailable) {
            developers.push({
              name,
              expertise,
              hourlyRate,
              walletAddress: address,
              isAvailable
            });
          }
        }
      } catch (error) {
        console.error(`Error processing developer ${i}:`, error);
        continue;
      }
    }

    console.log("Final available developers:", developers);
    return developers;
  } catch (error: any) {
    console.error("Error in getAllDevelopers:", error);
    throw new Error(error.message || "Failed to load developers");
  }
} 