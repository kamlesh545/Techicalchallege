#include <iostream>
#include <thread>
#include <atomic>
#include <random>
#include <chrono>

// Global atomic variables to control the simulation
std::atomic<bool> running{ false };
std::atomic<bool> generating{ false };

// Function to generate random temperature and humidity values
void generateData() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> tempDist(-10.0, 50.0);
    std::uniform_int_distribution<> humDist(0, 100);

    while (running) {
        if (generating) {
            double temperature = tempDist(gen);
            int humidity = humDist(gen);

            std::cout << "Temperature: " << temperature << "°C, Humidity: " << humidity << "%" << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(1)); // simulate 1-second interval
        }
    }
}

// Function to start the simulation
void startSimulation() {
    if (!running) {
        running = true;
        generating = true;
        std::thread dataThread(generateData);
        dataThread.detach();
        std::cout << "Simulation started." << std::endl;
    }
    else {
        generating = true;
        std::cout << "Simulation is already running." << std::endl;
    }
}

// Function to stop the simulation
void stopSimulation() {
    generating = false;
    std::cout << "Simulation stopped." << std::endl;
}

// Function to check the status of the simulation
void checkStatus() {
    if (generating) {
        std::cout << "Simulation is running." << std::endl;
    }
    else {
        std::cout << "Simulation is stopped." << std::endl;
    }
}

int main() {
    char command;
    do {
        std::cout << "Enter command (s: start, t: stop, c: check status, q: quit): ";
        std::cin >> command;

        switch (command) {
        case 's':
            startSimulation();
            break;
        case 't':
            stopSimulation();
            break;
        case 'c':
            checkStatus();
            break;
        case 'q':
            running = false;
            std::cout << "Exiting program." << std::endl;
            break;
        default:
            std::cout << "Invalid command." << std::endl;
            break;
        }
    } while (command != 'q');

    return 0;
}
