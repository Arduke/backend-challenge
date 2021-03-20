import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { EditPlayerDto } from './dtos/edit-player.dto';
import { Player } from './players.entity';
import { PlayerRepository } from './players.repository';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(PlayerRepository)
        private playerRepository: PlayerRepository
    ) {}

    async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
        return this.playerRepository.createPlayer(createPlayerDto);
    }

    async editPlayer(editPlayerDto: EditPlayerDto) : Promise<Player> {
        return this.playerRepository.editPlayerById(editPlayerDto);
    }

    async showSimplePlayers(): Promise<any[]> {
        return this.playerRepository.showSimplePlayers()
    }

    async showDetailsPlayers(): Promise<any> {
        return this.playerRepository.showDetailsPlayers()
    }

    async deletePlayerById(idPlayer: string): Promise<any> {
        return this.playerRepository.delete(idPlayer)
    }
}
