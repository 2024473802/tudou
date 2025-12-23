/**
 * 武侠土豆兄弟 - 游戏主逻辑
 * Wuxia Potato Brothers - Main Game Logic
 */

// ============================================
// 游戏配置
// ============================================
const CONFIG = {
    CANVAS_WIDTH: 800,  // Will be updated in init()
    CANVAS_HEIGHT: 600, // Will be updated in init()
    WAVE_DURATION: 30, // 每波持续秒数
    BASE_ENEMY_COUNT: 5,
    ENEMY_SPAWN_INTERVAL: 2000, // 敌人生成间隔(ms)
    PICKUP_RADIUS: 50,
    PLAYER_BASE_SPEED: 3,
    PLAYER_BASE_HEALTH: 100,
    PLAYER_BASE_DAMAGE: 10,
};

// Diagonal movement speed factor (1/√2 ≈ 0.707)
const DIAGONAL_SPEED_FACTOR = 1 / Math.sqrt(2);

// ============================================
// 武侠武器数据
// ============================================
const WEAPONS = {
    sword: {
        name: '青龙剑',
        icon: '🗡️',
        damage: 12,
        attackSpeed: 1.0,
        range: 80,
        description: '锋利的长剑，攻击迅速'
    },
    broadsword: {
        name: '屠龙刀',
        icon: '⚔️',
        damage: 25,
        attackSpeed: 0.6,
        range: 100,
        description: '沉重的大刀，伤害极高'
    },
    dagger: {
        name: '血影匕首',
        icon: '🔪',
        damage: 8,
        attackSpeed: 2.0,
        range: 50,
        description: '快如闪电的匕首'
    },
    fan: {
        name: '铁扇公主扇',
        icon: '🪭',
        damage: 15,
        attackSpeed: 1.2,
        range: 120,
        description: '可远程攻击的铁扇'
    },
    staff: {
        name: '齐天棍',
        icon: '🥢',
        damage: 18,
        attackSpeed: 0.8,
        range: 90,
        description: '攻击范围广的长棍'
    },
    bow: {
        name: '穿云弓',
        icon: '🏹',
        damage: 14,
        attackSpeed: 0.7,
        range: 200,
        description: '远程攻击，射程极远'
    },
    fist: {
        name: '降龙十八掌',
        icon: '👊',
        damage: 20,
        attackSpeed: 1.5,
        range: 60,
        description: '以气御敌的拳法'
    },
    needles: {
        name: '暗器飞针',
        icon: '📍',
        damage: 6,
        attackSpeed: 3.0,
        range: 150,
        description: '连续发射的暗器'
    }
};

// ============================================
// 武侠敌人数据
// ============================================
const ENEMIES = {
    bandit: {
        name: '山贼',
        icon: '👤',
        color: '#8B4513',
        health: 20,
        damage: 5,
        speed: 1.5,
        exp: 5,
        gold: 2
    },
    assassin: {
        name: '黑衣刺客',
        icon: '🥷',
        color: '#2C3E50',
        health: 30,
        damage: 10,
        speed: 2.5,
        exp: 10,
        gold: 5
    },
    warrior: {
        name: '武林叛徒',
        icon: '🧔',
        color: '#7F8C8D',
        health: 50,
        damage: 8,
        speed: 1.2,
        exp: 15,
        gold: 8
    },
    demon: {
        name: '魔教弟子',
        icon: '😈',
        color: '#8E44AD',
        health: 40,
        damage: 15,
        speed: 2.0,
        exp: 20,
        gold: 10
    },
    boss: {
        name: '武林盟主',
        icon: '👹',
        color: '#C0392B',
        health: 200,
        damage: 25,
        speed: 1.0,
        exp: 100,
        gold: 50
    }
};

// ============================================
// 商店物品数据
// ============================================
const SHOP_ITEMS = [
    { type: 'weapon', id: 'sword', price: 20 },
    { type: 'weapon', id: 'broadsword', price: 35 },
    { type: 'weapon', id: 'dagger', price: 15 },
    { type: 'weapon', id: 'fan', price: 25 },
    { type: 'weapon', id: 'staff', price: 30 },
    { type: 'weapon', id: 'bow', price: 40 },
    { type: 'weapon', id: 'fist', price: 45 },
    { type: 'weapon', id: 'needles', price: 35 },
    { type: 'stat', id: 'health', name: '金创药', icon: '🧪', description: '+20 最大生命', price: 15, effect: { maxHealth: 20 } },
    { type: 'stat', id: 'damage', name: '力道丹', icon: '💪', description: '+10% 攻击力', price: 20, effect: { damageMultiplier: 0.1 } },
    { type: 'stat', id: 'speed', name: '神行符', icon: '💨', description: '+10% 移动速度', price: 15, effect: { speedMultiplier: 0.1 } },
    { type: 'stat', id: 'attackSpeed', name: '疾风散', icon: '⚡', description: '+15% 攻击速度', price: 25, effect: { attackSpeedMultiplier: 0.15 } },
    { type: 'stat', id: 'regen', name: '回春丹', icon: '💚', description: '每秒回复2点生命', price: 30, effect: { healthRegen: 2 } },
    { type: 'stat', id: 'pickup', name: '吸金术', icon: '🧲', description: '+30% 拾取范围', price: 20, effect: { pickupRadius: 0.3 } },
];

// ============================================
// 升级奖励数据
// ============================================
const LEVELUP_OPTIONS = [
    { id: 'maxHealth', name: '铁布衫', icon: '🛡️', description: '+25 最大生命', effect: { maxHealth: 25 } },
    { id: 'damage', name: '九阳神功', icon: '🔥', description: '+15% 攻击力', effect: { damageMultiplier: 0.15 } },
    { id: 'speed', name: '凌波微步', icon: '👟', description: '+12% 移动速度', effect: { speedMultiplier: 0.12 } },
    { id: 'attackSpeed', name: '独孤九剑', icon: '⚔️', description: '+20% 攻击速度', effect: { attackSpeedMultiplier: 0.2 } },
    { id: 'regen', name: '易筋经', icon: '💖', description: '每秒回复3点生命', effect: { healthRegen: 3 } },
    { id: 'armor', name: '金钟罩', icon: '🔰', description: '减少10%受到的伤害', effect: { armor: 0.1 } },
];

// ============================================
// 游戏状态
// ============================================
let game = {
    state: 'menu', // menu, playing, shop, levelup, gameover
    canvas: null,
    ctx: null,
    animationId: null,
    lastTime: 0,
    
    // 玩家数据
    player: null,
    selectedCharacter: 'sword',
    
    // 游戏数据
    wave: 1,
    timer: CONFIG.WAVE_DURATION,
    gold: 0,
    totalGold: 0,
    kills: 0,
    
    // 游戏对象
    enemies: [],
    projectiles: [],
    pickups: [],
    damageNumbers: [],
    
    // 敌人生成
    enemySpawnTimer: 0,
    enemiesSpawnedThisWave: 0,
    
    // 输入状态
    keys: {},
    
    // 是否暂停
    paused: false
};

// ============================================
// 玩家类
// ============================================
class Player {
    constructor(character) {
        this.x = CONFIG.CANVAS_WIDTH / 2;
        this.y = CONFIG.CANVAS_HEIGHT / 2;
        this.radius = 25;
        this.character = character;
        
        // 基础属性
        this.maxHealth = CONFIG.PLAYER_BASE_HEALTH;
        this.health = this.maxHealth;
        this.baseSpeed = CONFIG.PLAYER_BASE_SPEED;
        this.baseDamage = CONFIG.PLAYER_BASE_DAMAGE;
        
        // 属性加成
        this.damageMultiplier = 1;
        this.speedMultiplier = 1;
        this.attackSpeedMultiplier = 1;
        this.healthRegen = 0;
        this.armor = 0;
        this.pickupRadius = CONFIG.PICKUP_RADIUS;
        
        // 经验和等级
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 10;
        
        // 武器
        this.weapons = [];
        this.attackTimers = [];
        
        // 角色特性
        this.applyCharacterBonus(character);
        
        // 初始武器
        this.addWeapon('sword');
    }
    
    applyCharacterBonus(character) {
        switch(character) {
            case 'sword':
                this.damageMultiplier = 1.1;
                break;
            case 'monk':
                this.maxHealth *= 1.2;
                this.health = this.maxHealth;
                break;
            case 'assassin':
                this.speedMultiplier = 1.15;
                break;
        }
    }
    
    get speed() {
        return this.baseSpeed * this.speedMultiplier;
    }
    
    get damage() {
        return this.baseDamage * this.damageMultiplier;
    }
    
    addWeapon(weaponId) {
        if (this.weapons.length < 6) {
            this.weapons.push(weaponId);
            this.attackTimers.push(0);
            this.updateWeaponBar();
        }
    }
    
    updateWeaponBar() {
        for (let i = 0; i < 6; i++) {
            const slot = document.getElementById(`weapon-slot-${i}`);
            if (this.weapons[i]) {
                const weapon = WEAPONS[this.weapons[i]];
                slot.textContent = weapon.icon;
                slot.classList.add('active');
            } else {
                slot.textContent = '';
                slot.classList.remove('active');
            }
        }
    }
    
    update(deltaTime, enemies) {
        // 移动
        let dx = 0, dy = 0;
        if (game.keys['w'] || game.keys['arrowup']) dy = -1;
        if (game.keys['s'] || game.keys['arrowdown']) dy = 1;
        if (game.keys['a'] || game.keys['arrowleft']) dx = -1;
        if (game.keys['d'] || game.keys['arrowright']) dx = 1;
        
        // 标准化对角移动
        if (dx !== 0 && dy !== 0) {
            dx *= DIAGONAL_SPEED_FACTOR;
            dy *= DIAGONAL_SPEED_FACTOR;
        }
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        
        // 边界检查
        this.x = Math.max(this.radius, Math.min(CONFIG.CANVAS_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius + 80, Math.min(CONFIG.CANVAS_HEIGHT - this.radius - 100, this.y));
        
        // 生命恢复
        if (this.healthRegen > 0) {
            this.health = Math.min(this.maxHealth, this.health + this.healthRegen * deltaTime / 1000);
        }
        
        // 攻击
        this.attack(deltaTime, enemies);
        
        // 拾取物品
        this.collectPickups();
    }
    
    attack(deltaTime, enemies) {
        for (let i = 0; i < this.weapons.length; i++) {
            const weaponId = this.weapons[i];
            const weapon = WEAPONS[weaponId];
            const attackInterval = 1000 / (weapon.attackSpeed * this.attackSpeedMultiplier);
            
            this.attackTimers[i] += deltaTime;
            
            if (this.attackTimers[i] >= attackInterval) {
                this.attackTimers[i] = 0;
                
                // 找到最近的敌人
                let nearestEnemy = null;
                let nearestDist = weapon.range;
                
                for (const enemy of enemies) {
                    const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestEnemy = enemy;
                    }
                }
                
                if (nearestEnemy) {
                    // 发射弹药
                    const angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
                    game.projectiles.push(new Projectile(
                        this.x, this.y,
                        angle,
                        weapon.damage * this.damageMultiplier,
                        weapon.range,
                        weapon.icon
                    ));
                }
            }
        }
    }
    
    collectPickups() {
        for (let i = game.pickups.length - 1; i >= 0; i--) {
            const pickup = game.pickups[i];
            const dist = Math.hypot(pickup.x - this.x, pickup.y - this.y);
            
            if (dist < this.pickupRadius) {
                if (pickup.type === 'gold') {
                    game.gold += pickup.value;
                    game.totalGold += pickup.value;
                    createDamageNumber(pickup.x, pickup.y, `+${pickup.value}`, 'gold');
                } else if (pickup.type === 'exp') {
                    this.gainExp(pickup.value);
                } else if (pickup.type === 'health') {
                    const healed = Math.min(pickup.value, this.maxHealth - this.health);
                    this.health += healed;
                    if (healed > 0) {
                        createDamageNumber(this.x, this.y, `+${Math.floor(healed)}`, 'heal');
                    }
                }
                game.pickups.splice(i, 1);
            }
        }
    }
    
    gainExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToLevel) {
            this.exp -= this.expToLevel;
            this.level++;
            this.expToLevel = Math.floor(this.expToLevel * 1.5);
            showLevelUp();
        }
        updateHUD();
    }
    
    takeDamage(amount) {
        const actualDamage = amount * (1 - this.armor);
        this.health -= actualDamage;
        createDamageNumber(this.x, this.y - 30, `-${Math.floor(actualDamage)}`);
        
        if (this.health <= 0) {
            this.health = 0;
            gameOver();
        }
        updateHUD();
    }
    
    applyStatBonus(effect) {
        if (effect.maxHealth) {
            this.maxHealth += effect.maxHealth;
            this.health += effect.maxHealth;
        }
        if (effect.damageMultiplier) {
            this.damageMultiplier += effect.damageMultiplier;
        }
        if (effect.speedMultiplier) {
            this.speedMultiplier += effect.speedMultiplier;
        }
        if (effect.attackSpeedMultiplier) {
            this.attackSpeedMultiplier += effect.attackSpeedMultiplier;
        }
        if (effect.healthRegen) {
            this.healthRegen += effect.healthRegen;
        }
        if (effect.armor) {
            this.armor = Math.min(0.8, this.armor + effect.armor);
        }
        if (effect.pickupRadius) {
            this.pickupRadius *= (1 + effect.pickupRadius);
        }
    }
    
    draw(ctx) {
        // 绘制拾取范围（可选）
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.pickupRadius, 0, Math.PI * 2);
        // ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        // ctx.stroke();
        
        // 绘制角色
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#D4A574';
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 绘制角色图标
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = { sword: '⚔️', monk: '🥋', assassin: '🗡️' };
        ctx.fillText(icons[this.character] || '🥔', this.x, this.y);
    }
}

// ============================================
// 敌人类
// ============================================
class Enemy {
    constructor(type, x, y, waveMultiplier = 1) {
        const data = ENEMIES[type];
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = type === 'boss' ? 40 : 20;
        
        this.maxHealth = data.health * waveMultiplier;
        this.health = this.maxHealth;
        this.damage = data.damage * waveMultiplier;
        this.speed = data.speed;
        this.exp = data.exp;
        this.gold = data.gold;
        this.icon = data.icon;
        this.color = data.color;
        
        this.attackCooldown = 0;
        this.attackInterval = 1000;
    }
    
    update(deltaTime, player) {
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > this.radius + player.radius) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        } else {
            // 攻击玩家
            this.attackCooldown -= deltaTime;
            if (this.attackCooldown <= 0) {
                player.takeDamage(this.damage);
                this.attackCooldown = this.attackInterval;
            }
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        createDamageNumber(this.x, this.y - 20, Math.floor(amount));
        
        if (this.health <= 0) {
            return true; // 死亡
        }
        return false;
    }
    
    draw(ctx) {
        // 血条
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2, 5);
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2 * healthPercent, 5);
        
        // 身体
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 图标
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);
    }
}

// ============================================
// 弹药类
// ============================================
class Projectile {
    constructor(x, y, angle, damage, range, icon) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.damage = damage;
        this.maxRange = range;
        this.traveled = 0;
        this.icon = icon;
        this.radius = 10;
    }
    
    update(deltaTime) {
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;
        this.x += moveX;
        this.y += moveY;
        this.traveled += Math.hypot(moveX, moveY);
        
        return this.traveled >= this.maxRange;
    }
    
    draw(ctx) {
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);
    }
}

// ============================================
// 掉落物类
// ============================================
class Pickup {
    constructor(x, y, type, value) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.value = value;
        this.radius = 10;
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    draw(ctx) {
        const bob = Math.sin(Date.now() / 200 + this.bobOffset) * 3;
        
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.type === 'gold') {
            ctx.fillText('💰', this.x, this.y + bob);
        } else if (this.type === 'exp') {
            ctx.fillText('✨', this.x, this.y + bob);
        } else if (this.type === 'health') {
            ctx.fillText('❤️', this.x, this.y + bob);
        }
    }
}

// ============================================
// 工具函数
// ============================================

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (mutates original)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createDamageNumber(x, y, text, type = 'damage') {
    const div = document.createElement('div');
    div.className = `damage-number ${type}`;
    div.textContent = text;
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 1000);
}

function updateHUD() {
    const healthPercent = (game.player.health / game.player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = healthPercent + '%';
    document.getElementById('health-text').textContent = 
        `${Math.floor(game.player.health)}/${Math.floor(game.player.maxHealth)}`;
    
    const expPercent = (game.player.exp / game.player.expToLevel) * 100;
    document.getElementById('exp-fill').style.width = expPercent + '%';
    document.getElementById('exp-text').textContent = 
        `经验: ${game.player.exp}/${game.player.expToLevel}`;
    
    document.getElementById('gold-amount').textContent = game.gold;
    document.getElementById('level').textContent = game.player.level;
    document.getElementById('wave-number').textContent = game.wave;
    document.getElementById('timer').textContent = Math.ceil(game.timer);
}

function spawnEnemy() {
    const types = ['bandit', 'assassin', 'warrior', 'demon'];
    const weights = [40, 30, 20, 10];
    
    // 根据波数调整权重
    if (game.wave >= 5) {
        weights[2] += 10;
        weights[3] += 10;
    }
    
    // 选择敌人类型
    let type = 'bandit';
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < types.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
            type = types[i];
            break;
        }
    }
    
    // 在屏幕边缘生成
    let x, y;
    const side = Math.floor(Math.random() * 4);
    switch(side) {
        case 0: // 上
            x = Math.random() * CONFIG.CANVAS_WIDTH;
            y = -30;
            break;
        case 1: // 下
            x = Math.random() * CONFIG.CANVAS_WIDTH;
            y = CONFIG.CANVAS_HEIGHT + 30;
            break;
        case 2: // 左
            x = -30;
            y = Math.random() * CONFIG.CANVAS_HEIGHT;
            break;
        case 3: // 右
            x = CONFIG.CANVAS_WIDTH + 30;
            y = Math.random() * CONFIG.CANVAS_HEIGHT;
            break;
    }
    
    const waveMultiplier = 1 + (game.wave - 1) * 0.2;
    game.enemies.push(new Enemy(type, x, y, waveMultiplier));
    game.enemiesSpawnedThisWave++;
}

function spawnBoss() {
    const x = Math.random() < 0.5 ? -50 : CONFIG.CANVAS_WIDTH + 50;
    const y = CONFIG.CANVAS_HEIGHT / 2;
    const waveMultiplier = 1 + (game.wave - 1) * 0.3;
    game.enemies.push(new Enemy('boss', x, y, waveMultiplier));
}

// ============================================
// 商店系统
// ============================================
function openShop() {
    game.state = 'shop';
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-gold').textContent = game.gold;
    
    generateShopItems();
}

function generateShopItems() {
    const shopContainer = document.getElementById('shop-items');
    shopContainer.innerHTML = '';
    
    // 随机选择5个物品 using Fisher-Yates shuffle
    const shuffled = shuffleArray([...SHOP_ITEMS]);
    const items = shuffled.slice(0, 5);
    
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.dataset.index = index;
        
        let icon, name, description, price;
        if (item.type === 'weapon') {
            const weapon = WEAPONS[item.id];
            icon = weapon.icon;
            name = weapon.name;
            description = weapon.description;
            price = item.price;
        } else {
            icon = item.icon;
            name = item.name;
            description = item.description;
            price = item.price;
        }
        
        // Use DOM methods to avoid innerHTML XSS risks
        const iconDiv = document.createElement('div');
        iconDiv.className = 'shop-item-icon';
        iconDiv.textContent = icon;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'shop-item-name';
        nameDiv.textContent = name;
        
        const descDiv = document.createElement('div');
        descDiv.className = 'shop-item-desc';
        descDiv.textContent = description;
        
        const priceDiv = document.createElement('div');
        priceDiv.className = 'shop-item-price';
        priceDiv.textContent = `💰 ${price}`;
        
        div.appendChild(iconDiv);
        div.appendChild(nameDiv);
        div.appendChild(descDiv);
        div.appendChild(priceDiv);
        
        div.addEventListener('click', () => buyItem(item, div));
        shopContainer.appendChild(div);
    });
}

function buyItem(item, element) {
    if (element.classList.contains('sold')) return;
    
    const price = item.price;
    if (game.gold < price) {
        // 显示金币不足提示
        element.style.animation = 'shake 0.3s';
        setTimeout(() => element.style.animation = '', 300);
        return;
    }
    
    game.gold -= price;
    document.getElementById('shop-gold').textContent = game.gold;
    
    if (item.type === 'weapon') {
        if (game.player.weapons.length < 6) {
            game.player.addWeapon(item.id);
        } else {
            // 武器槽已满
            return;
        }
    } else {
        game.player.applyStatBonus(item.effect);
    }
    
    element.classList.add('sold');
    const soldDiv = document.createElement('div');
    soldDiv.style.color = '#888';
    soldDiv.style.marginTop = '10px';
    soldDiv.textContent = '已购买';
    element.appendChild(soldDiv);
}

function rerollShop() {
    if (game.gold >= 5) {
        game.gold -= 5;
        document.getElementById('shop-gold').textContent = game.gold;
        generateShopItems();
    }
}

function continueGame() {
    game.state = 'playing';
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    // 开始新波次
    game.wave++;
    game.timer = CONFIG.WAVE_DURATION;
    game.enemiesSpawnedThisWave = 0;
    
    // 每5波出Boss
    if (game.wave % 5 === 0) {
        spawnBoss();
    }
    
    updateHUD();
}

// ============================================
// 升级系统
// ============================================
function showLevelUp() {
    game.paused = true;
    document.getElementById('levelup-screen').classList.remove('hidden');
    
    const container = document.getElementById('levelup-options');
    container.innerHTML = '';
    
    // 随机选择3个升级选项 using Fisher-Yates shuffle
    const shuffled = shuffleArray([...LEVELUP_OPTIONS]);
    const options = shuffled.slice(0, 3);
    
    options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'levelup-option';
        
        // Use DOM methods to avoid innerHTML XSS risks
        const iconDiv = document.createElement('div');
        iconDiv.className = 'levelup-option-icon';
        iconDiv.textContent = option.icon;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'levelup-option-name';
        nameDiv.textContent = option.name;
        
        const descDiv = document.createElement('div');
        descDiv.className = 'levelup-option-desc';
        descDiv.textContent = option.description;
        
        div.appendChild(iconDiv);
        div.appendChild(nameDiv);
        div.appendChild(descDiv);
        
        div.addEventListener('click', () => selectLevelUp(option));
        container.appendChild(div);
    });
}

function selectLevelUp(option) {
    game.player.applyStatBonus(option.effect);
    document.getElementById('levelup-screen').classList.add('hidden');
    game.paused = false;
    updateHUD();
}

// ============================================
// 游戏结束
// ============================================
function gameOver() {
    game.state = 'gameover';
    cancelAnimationFrame(game.animationId);
    
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    
    document.getElementById('final-wave').textContent = game.wave;
    document.getElementById('final-kills').textContent = game.kills;
    document.getElementById('final-gold').textContent = game.totalGold;
}

// ============================================
// 游戏主循环
// ============================================
function gameLoop(timestamp) {
    if (game.state !== 'playing') return;
    
    const deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    
    if (!game.paused) {
        // 更新计时器
        game.timer -= deltaTime / 1000;
        if (game.timer <= 0) {
            // 波次结束，进入商店
            openShop();
            return;
        }
        
        // 生成敌人
        game.enemySpawnTimer += deltaTime;
        const maxEnemies = CONFIG.BASE_ENEMY_COUNT + game.wave * 2;
        if (game.enemySpawnTimer >= CONFIG.ENEMY_SPAWN_INTERVAL && 
            game.enemies.length < maxEnemies) {
            spawnEnemy();
            game.enemySpawnTimer = 0;
        }
        
        // 更新玩家
        game.player.update(deltaTime, game.enemies);
        
        // 更新敌人
        for (const enemy of game.enemies) {
            enemy.update(deltaTime, game.player);
        }
        
        // 更新弹药
        for (let i = game.projectiles.length - 1; i >= 0; i--) {
            const projectile = game.projectiles[i];
            const expired = projectile.update(deltaTime);
            
            if (expired) {
                game.projectiles.splice(i, 1);
                continue;
            }
            
            // 检测碰撞
            for (let j = game.enemies.length - 1; j >= 0; j--) {
                const enemy = game.enemies[j];
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
                
                if (dist < projectile.radius + enemy.radius) {
                    const dead = enemy.takeDamage(projectile.damage);
                    game.projectiles.splice(i, 1);
                    
                    if (dead) {
                        // 掉落物品
                        game.pickups.push(new Pickup(enemy.x, enemy.y, 'gold', enemy.gold));
                        game.pickups.push(new Pickup(enemy.x + 20, enemy.y, 'exp', enemy.exp));
                        if (Math.random() < 0.1) {
                            game.pickups.push(new Pickup(enemy.x - 20, enemy.y, 'health', 10));
                        }
                        
                        game.enemies.splice(j, 1);
                        game.kills++;
                    }
                    break;
                }
            }
        }
        
        updateHUD();
    }
    
    // 渲染
    render();
    
    game.animationId = requestAnimationFrame(gameLoop);
}

function render() {
    const ctx = game.ctx;
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // 绘制背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    // 绘制掉落物
    for (const pickup of game.pickups) {
        pickup.draw(ctx);
    }
    
    // 绘制弹药
    for (const projectile of game.projectiles) {
        projectile.draw(ctx);
    }
    
    // 绘制敌人
    for (const enemy of game.enemies) {
        enemy.draw(ctx);
    }
    
    // 绘制玩家
    game.player.draw(ctx);
}

// ============================================
// 初始化
// ============================================
function init() {
    // 获取画布
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    // 设置画布大小
    function resizeCanvas() {
        CONFIG.CANVAS_WIDTH = window.innerWidth;
        CONFIG.CANVAS_HEIGHT = window.innerHeight;
        game.canvas.width = CONFIG.CANVAS_WIDTH;
        game.canvas.height = CONFIG.CANVAS_HEIGHT;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 键盘事件
    window.addEventListener('keydown', (e) => {
        game.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
        game.keys[e.key.toLowerCase()] = false;
    });
    
    // 菜单按钮
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('how-to-play').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    });
    document.getElementById('back-to-menu').addEventListener('click', () => {
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    });
    
    // 角色选择
    document.querySelectorAll('.character-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.character-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            game.selectedCharacter = option.dataset.character;
        });
    });
    
    // 商店按钮
    document.getElementById('reroll-btn').addEventListener('click', rerollShop);
    document.getElementById('continue-btn').addEventListener('click', continueGame);
    
    // 重新开始
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    });
}

function startGame() {
    // 重置游戏状态
    game.state = 'playing';
    game.wave = 1;
    game.timer = CONFIG.WAVE_DURATION;
    game.gold = 0;
    game.totalGold = 0;
    game.kills = 0;
    game.enemies = [];
    game.projectiles = [];
    game.pickups = [];
    game.enemySpawnTimer = 0;
    game.enemiesSpawnedThisWave = 0;
    game.paused = false;
    game.lastTime = performance.now();
    
    // 创建玩家
    game.player = new Player(game.selectedCharacter);
    
    // 切换界面
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    updateHUD();
    
    // 开始游戏循环
    game.animationId = requestAnimationFrame(gameLoop);
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
