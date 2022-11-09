import Homing from '../projectiles/homing.js';
import Penetrate from '../projectiles/penetrate.js';
import Bomb from '../projectiles/bomb.js'
const Config = require("../../Config");
const Phaser = require("phaser");

export default class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y, db) {
        super(scene, x, y, db.idleSprite);

        this.attack = db.attack;
        this.aspd = db.aspd;
        this.range = db.range;
        this.attackType = db.attackType;
        this.idleAnim = db.idleAnim;
        this.attackAnim = db.attackAnim;
        this.projectileName = "bullet";
        this.projectileAnimName = "bullet";
        this.projectileType = 1;
        
        this.isTarget = false;
        this.isUnit = true;

        this.buffAtk = 1;
        this.buffAspd = 0;

        this.scale = 1;
        this.alpha = 1;      
        this.shootSound = this.scene.sound.add("shoot");
        
        this.target = [];
        
        this.setMotionSpeed();

        this.kills = 0;
        this.isTarget = false;

        this.setInteractive({ draggable: true });
        this.scene.physics.add.existing(this);
        this.setBodySize(64, 64, true);
        this.scene.add.existing(this);
        
        this.activateAttack();
        console.log(this);
    }

    checkMob() {
        this.target = this.scene.physics.overlapCirc(this.x, this.y, this.range).filter(item => item.gameObject.isTarget == true);
        return this.target;
    }

    updateBuff()
    {
        this.attack *= this.buffAtk;
        this.aspd += this.buffAspd;
        this.setMotionSpeed();
    }

    setMotionSpeed()
    {
        this.attackConfig = this.scene.anims.get(this.attackAnim);
        this.attackConfig.frameRate *= this.aspd;
    }

    attackMob()
    {   
        if (this.target.length == 0)
        {
            this.play(this.idleAnim);
            return;
        }

        this.play(this.attackConfig, true);

        if (this.attackType == 0) {
            this.target.forEach(e => {
                e.gameObject.Health -= this.attack;
                if (e.gameObject.Health <= 0) {
                    this.kills++;
                    e.gameObject.death();
                    this.checkMob();
                }
            })
        }
        else if (this.attackType == 1) {
            this.shootSound.play({
            mute: false,
            volume: 0.7,
            rate: 1,
            loop: false
            });
            this.shootProjectile();
        }        
    }

    shootProjectile()
    {   
        if (this.projectileType == 0)
            return new Homing(this.scene, this);
        else if (this.projectileType == 1)
            return new Penetrate(this.scene, this);
        else if (this.projectileType == 2)
            return new Bomb(this.scene, this);
    }

    activateAttack()
    {
        this.scene.time.addEvent({
            delay: 1000 / this.aspd,
            callback: () => {
                this.checkMob();
                this.attackMob();
            },
            loop: true
        });
    }
}