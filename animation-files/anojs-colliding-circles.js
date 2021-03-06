// calixo888

let canvasDiv = document.querySelector("#anojs-colliding-circles");

canvasDiv.innerHTML += "<canvas id='anojs-colliding-circles-canvas'></canvas>";

let canvas = document.querySelector("#anojs-colliding-circles-canvas");

canvas.style.width = '100%';
canvas.style.height = '100%';

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

var c = canvas.getContext("2d");

let strokeColorArray = [
    "ANOJS_COLOR_1",
    "ANOJS_COLOR_2",
    "ANOJS_COLOR_3",
    "ANOJS_COLOR_4"
];

let fillColorArray = [
    "ANOJS_COLOR_5",
    "ANOJS_COLOR_6",
    "ANOJS_COLOR_7",
    "ANOJS_COLOR_8"
];

let mouse = {
    x: undefined,
    y: undefined
};

// Event Listeners
addEventListener("mousemove", event => {
    mouse.x = event.x;
    mouse.y = event.y;
})

addEventListener("resize", () => {
    innerWidth = window.innerWidth;
    innerHeight = window.innerHeight;
})

class Particle {
    constructor(x, y, dx, dy, radius, strokeColor, fillColor) {
        this.x = x;
        this.y = y;
        this.velocity = {
            x: dx,
            y: dy
        };
        this.radius = radius;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.mass = 1;
        this.opacity = 0;
    }

    draw() {
        c.strokeStyle = this.strokeColor;
        c.fillStyle = this.fillColor;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.save();
        c.globalAlpha = this.opacity;
        c.fill();
        c.restore();
        c.stroke();
        c.closePath();
    }

    update(particles) {
        if (this.x + this.radius + this.velocity.x >= innerWidth || this.x + this.radius + this.velocity.x <= 0) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y + this.radius + this.velocity.y >= innerHeight || this.y + this.radius + this.velocity.y <= 0) {
            this.velocity.y = -this.velocity.y;
        }

        if (getDistance(mouse.x, mouse.y, this.x, this.y) < 100 && this.opacity < 0.5) {
            this.opacity += 0.03;
        } else if (this.opacity > 0) {
            this.opacity -= 0.03;
            this.opacity = Math.max(0, this.opacity);
        }

        for (let particle of particles) {
            if (this === particle) {
                continue;
            } else {
                if (getDistance(this.x, this.y, particle.x, particle.y) - (this.radius * 2) < 0) {
                    resolveCollision(this, particle);
                }
            }
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.draw();
    }
}

let getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const local_mass = particle.mass;
        const other_mass = otherParticle.mass;

        //masses mathified for readability
        const mass_sum = local_mass + other_mass;
        const mass_diff = local_mass - other_mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * mass_diff / mass_sum + u2.x * 2 * other_mass / mass_sum, y: u1.y };
        const v2 = { x: u2.x * mass_diff / mass_sum + u1.x * 2 * other_mass / mass_sum, y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

let particles = [];

let init = () => {
    for (let i = 0; i < 300; i++) {
        let x = (Math.random() * (innerWidth - 50)) + 25;
        let y = (Math.random() * (innerHeight - 50)) + 25;
        let dx = (Math.random() - 0.5) * 3;
        let dy = (Math.random() - 0.5) * 3;
        const radius = 15;
        const strokeColor = strokeColorArray[Math.floor(Math.random() * strokeColorArray.length)];
        const fillColor = fillColorArray[strokeColorArray.indexOf(strokeColor)];

        if (i !== 0) {
            for (let j = 0; j < particles.length; j++) {
                let tempParticle = particles[j];
                if (getDistance(x, y, tempParticle.x, tempParticle.y) - (radius * 2) < 0) {
                    x = (Math.random() * (innerWidth - 50)) + 25;
                    y = (Math.random() * (innerHeight - 50)) + 25;

                    j = -1;
                }
            }
        }

        let particle = new Particle(x, y, dx, dy, radius, strokeColor, fillColor);
        particles.push(particle);
    }
}

let animate = () => {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);

    particles.forEach(particle => {
        particle.update(particles);
    });
}

init();
animate();