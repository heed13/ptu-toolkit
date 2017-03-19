/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Utility Functions
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var TrainerSkills = (function() {
    return {Acrobatics:0,Athletics:0,Charm:0,Combat:0,Command:0,GeneralEducation:0,MedicineEducation:0,OccultEducation:0,PokemonEducation:0,TechnologyEducation:0,Focus:0,Guile:0,Intimidation:0,Intuition:0,Perception:0,Stealth:0,Survival:0};
});
var TrainerStats = (function() {
    return {HP:0,Attack:0,Defense:0,SpecialAttack:0,SpecialDefense:0,Speed:0};
});

var TrainerTestData = (function(){
    return {
        id: 125,
        playerName: "sean",
        name: "heed",
        pictureUrl: "http://otakukart.com/animeblog/wp-content/uploads/2015/12/maxresdefault5.jpg",
        levelUpStats: {
            HP: 3,
            Attack: 2,
            Defense: 3,
            SpecialAttack: 1,
            SpecialDefense: 5,
            Speed: 6
        },
        moves: ["Assurance"],
        features: ["Brawler"],
        edges: ["Gem Lore", "Athletic Initiative"],
        miscExp: 0,
        milestones: 0,
        background: {
            adeptSkill: "Athletics",
            noviceSkill: "Guile",
            patheticSkills: ["Perception","GeneralEducation","Focus"]
        },
        pokemon: ["","","","",""],
        inventory: []
    };
});

/**
 * Trianer Save Data
 */
var TrainerData = {
    id: null,
    playerName: "",
    name: "",
    levelUpStats: {
        HP: 0,
        Attack: 0,
        SpecialAttack: 0,
        SpecialDefense: 0,
        Speed: 0
    },
    moves: [],
    features: [],
    edges: [],
    level: 0,
    miscExp: 0,
    milestones: 0,
    background: {
        adeptSkill: "",
        noviceSkill: "",
        patheticSkills: ["","",""]
    },
    pokemon: ["","","","",""],
};

/**
 * Trainer Base Class Controller
 */
var Trainer = (function() {
    
    return {
        // Public Vars
        skills: new TrainerSkills(),
        level: 0,
        capabilities: {},
        stats: new TrainerStats(),
        // Functions
        adjustSkill: function(skillName, amount) {
            this.skills[skillName] += amount;
        },
        resetLevel: function() {
            // Level = (# of milestones) + (misc xp/10)
            this.level = this.milestones + Math.floor(this.miscExp / 10);
        },
    };
});

/**
 * Trainer Factory
 * Creates a trainer object from trainer save data
 */
var TrainerFactory = (function() {
    var trainer = null;

    return {
        create: function(trainerData) {
            var d = $.Deferred();
            var factory = this; // In order to keep the 'this' context in the when statement
            $.when(TrainerModel.getAllTrainerInfo(trainerData)).then(function(data) {
                trainer = $.extend(trainerData, new Trainer());
                factory.applyMoves(data.moves);
                factory.applyFeatures(data.features);
                factory.applyEdges(data.edges);
                factory.applyExperience();
                factory.applyBackground();
                // TODO: remove me
                trainer.stats = trainer.levelUpStats;
                // end TODO
                d.resolve(trainer);
            });
            return d.promise();
        },
        applyMoves: function(movesData) {
            trainer.moves = movesData;
            // TODO: Any moves that grant capabilities?
        },
        applyFeatures: function(featuresData) {
            trainer.features = featuresData;
            // TODO: What are classes and what are normal features?
        },
        applyEdges: function(edgesData) {
            trainer.edges = edgesData;
            // TODO: Check skills and add to them
        },
        applyExperience: function() {
            trainer.resetLevel();
        },
        /**
         * Adjust adept, novice, and pathetic skills of the trainer being created
         */
        applyBackground: function() {
            var b = trainer.background;
            trainer.adjustSkill(b.adeptSkill, 2);
            trainer.adjustSkill(b.noviceSkill, 1);
            for (var i = 0; i < b.patheticSkills.length; ++i) {
                trainer.adjustSkill(b.patheticSkills[i], -1);
            }
        }
    };
})();

var TrainerModel = (function() {
    return {
        getAllTrainerInfo: function(trainerData) {
            var d = $.Deferred();
            
            $.when(
                this.getMoves(trainerData.moves),
                this.getFeatures(trainerData.features),
                this.getEdges(trainerData.edges)
            ).then(function(movesData, featuresData, edgesData) { 
                var returnData = {};
                returnData["moves"] = (movesData && movesData[0]) ? movesData[0] : {};
                returnData["features"] = (featuresData && featuresData[0]) ? featuresData[0] : {};
                returnData["edges"] = (edgesData && edgesData[0]) ? edgesData[0] : {};
                d.resolve(returnData);
            });
            
            return d.promise();
        },
        getMoves: function(movesList) {
            if (!movesList || movesList.length === 0) {
                return;
            }
            var uriMoves = encodeURIComponent(JSON.stringify(movesList));
            return $.getJSON("/api/v1/moves/?names=" + uriMoves);
        },
        getFeatures: function(featuresList) {
            if (!featuresList || featuresList.length === 0) {
                return;
            }
            var uriFeatures = encodeURIComponent(JSON.stringify(featuresList));
            return $.getJSON("/api/v1/features/?names=" + uriFeatures);
        },
        getEdges: function(edgesList) {
            if (!edgesList || edgesList.length === 0) {
                return;
            }
            var uriEdges = encodeURIComponent(JSON.stringify(edgesList));
            return $.getJSON("/api/v1/edges/?names=" + uriEdges);
        },
        getTrainerData: function(id) {
            var d = $.Deferred();
            $.when().then(function(trainerData) { 
                // TODO: add real implementation
                trainerData = new TrainerTestData();
                d.resolve(trainerData);
            });
            return d.promise();
        },
    };
})();

var TrainerView = (function() {
    var nameDiv = $("#trainerName");
    var playerNameDiv = $("#playerName");
    var profileImgDiv = $("#trainerImg");
    var statBlock = $("#statBlock");
    return {
        activate: function(trainer) {
            this.setProfileView(trainer);
            this.setStatBlock(trainer);
        },
        setProfileView: function(trainer) {
            $(nameDiv).text(trainer.name.capitalize());
            $(playerNameDiv).text(trainer.playerName.capitalize());
            $(profileImgDiv).attr("src",trainer.pictureUrl);
        },
        setStatBlock: function(trainer) {
            $(statBlock).find("#statBlock-Hp").text(trainer.stats.HP);
            $(statBlock).find("#statBlock-Atk").text(trainer.stats.Attack);
            $(statBlock).find("#statBlock-Def").text(trainer.stats.Defense);
            $(statBlock).find("#statBlock-SpAtk").text(trainer.stats.SpecialAttack);
            $(statBlock).find("#statBlock-SpDef").text(trainer.stats.SpecialDefense);
            $(statBlock).find("#statBlock-Speed").text(trainer.stats.Speed);
        }
    };
})();

var TrainerController = (function() {
    return {
        loadTrainer: function(id) {
            var d = $.Deferred();
            
            $.when(TrainerModel.getTrainerData(id)).then(function(trainerData) {
                $.when(TrainerFactory.create(trainerData)).then(function(trainer) {
                   d.resolve(trainer); 
                });
            });
            
            return d.promise();
        }
    };
})();


var testTrainer = {};
(function init(){
    $.when(TrainerController.loadTrainer()).then(function(trainer) {
        testTrainer = trainer;
        console.log(trainer);
        TrainerView.activate(trainer);
    });
})();