import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import {apiDetailLeague,apiSimpleLeague} from "src/configs/axios.api";
import { EntityRepository, Repository } from "typeorm";
import { CreatePlayerDto } from "./dtos/create-player.dto";
import { EditPlayerDto } from "./dtos/edit-player.dto";
import { Player } from "./players.entity";

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
    async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
        const {summonerName} = createPlayerDto;
        
        //tratar provavel erro
        try {
        var {data} = await apiSimpleLeague.get(`/${summonerName}`)
        } catch (error) {
          throw new Error(error)
        }
        
        const {accountId,name,profileIconId,id,summonerLevel,revisionDate, puuid} = data;
        const player = this.create({accountId,name,profileIconId,summonerId: id,summonerLevel,revisionDate, puuid})
        
        try {
            await player.save()
            return player;
        } catch (error) {
            if (error.code.toString() === '23505') {
                throw new ConflictException('Campo unico já está em uso');
              } else {
                throw new InternalServerErrorException(
                  'Erro ao salvar o usuário no banco de dados',
                );
              }
        }

    }

    async editPlayerById(editPlayerDto: EditPlayerDto): Promise<Player> {
      const {id,summonerName, summonerLevel} = editPlayerDto;

      const editPlayer = await this.findOne(id)

      if(editPlayer) {
      editPlayer.name = summonerName;
      editPlayer.summonerLevel = summonerLevel;
      }

      try {
        await editPlayer.save()
        return editPlayer;
      } catch (error) {
        if (error.code.toString() === '23505') {
          throw new ConflictException('Campo unico já está em uso');
        } else {
          throw new InternalServerErrorException(
            'Erro ao editar o usuário no banco de dados, os dados são foram editados',
          );
        }
      }

    }

    async showSimplePlayers(): Promise<any[]> {
      const players = await this.find()
      const simpleListPlayers = [];

      players.map(player => {            
          simpleListPlayers.push({
              id: player.id,
              nickname: player.name,
              accountId: player.accountId,
              summonerLevel: player.summonerLevel,
              profileIconId: player.profileIconId,
              summonerId: player.summonerId,
          })
      })

      return simpleListPlayers;
    }

    async showDetailsPlayers(): Promise<any[]> {
      const players = await this.find()
      const detailsListPlayers = [];

      for (const player of players) {
        const {data} = await apiDetailLeague.get(`/${player.summonerId}`)
        let totalWins = 0;
        let totalLosses = 0;

        if(data.length > 0){
          data.map(modo => {
            totalWins = modo.wins + totalWins;
            totalLosses = modo.losses + totalLosses;

            detailsListPlayers.push({
              id: player.id,
              nickname: player.name,
              accountId: player.accountId,
              summonerLevel: player.summonerLevel,
              profileIconId: player.profileIconId,
              summonerId: player.summonerId,
              wins: totalWins,
              losses: totalLosses,
            })
          })
        } else {
          detailsListPlayers.push({
            id: player.id,
            nickname: player.name,
            accountId: player.accountId,
            summonerLevel: player.summonerLevel,
            profileIconId: player.profileIconId,
            summonerId: player.summonerId,
            wins: 0,
            losses: 0,
          })
        }
      }

      return detailsListPlayers;
    }
}