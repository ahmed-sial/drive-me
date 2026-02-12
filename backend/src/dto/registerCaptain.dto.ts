import type RegisterUserDto from "./registerUser.dto.js";

export default interface RegisterCaptainDto extends RegisterUserDto {
    vehicle: {
        color: string;
        licensePlate: string;
        capacity: number;
        type: string;
    };
}