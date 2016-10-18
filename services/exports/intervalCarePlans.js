var pdf = require('pdfkit');
var fs = require('fs');


module.exports.exportCarePlan = function(data) {

      var doc = new pdf;
      var fileName = data.firstName + ' ' + data.lastName + '.pdf';

      doc.pipe(fs.createWriteStream(fileName));

      // date config
      var residentBirthDate = new Date(data.birthDate);
      var residentAdmissionDate = new Date(data.admissionDate);
      // var dateFilter = $filter('date');
      // var residentFilteredBirthDate = dateFilter(residentBirthDate, 'MMM d, yyyy');
      // var residentFilteredAdmissionDate = dateFilter(residentAdmissionDate, 'MMM d, yyyy');

      var arrayLengthOffset = 0;
      var adminOffset = 250;

      if (data.insideApartment === undefined) {
        data.insideApartment = {};
      }

      if (data.outApartment === undefined) {
        data.outApartment = {};
      }

      // font setup
      doc.fontSize(10);
      doc.fillColor(33, 33, 33);
      doc.font("Courier");
      //doc.fontType("bold");
      doc.lineGap(25);

      // address line
      doc.fillColor(236, 239, 241);
      doc.moveTo(0, 25).lineTo(650, 25).stroke();
      doc.text("ADDRESS", 14, 28);
      doc.text("3407 Carroll St Alamosa CO, 81101", 300, 28);

      // phone line
      //doc.fillColor("#CFD8DC");
      doc.moveTo(0, 50).lineTo(650, 50).stroke();
      doc.text("PHONE", 25, 53);
      doc.text("(719) 587-3514", 300, 53);

      // fax line
      doc.fillColor("rgb(176, 190, 197)");
      doc.moveTo(0, 75).lineTo(650, 75).stroke();
      doc.text("FAX", 36, 78);
      doc.text("(719) 589-3614", 300, 78);

      // web line
      doc.fillColor(144, 164, 174);
      doc.moveTo(0, 100).lineTo(650, 100).stroke();
      doc.text("WEB", 37, 103);
      doc.text("AlamosaBridge.com", 300, 103);

      // allergy
      doc.fillColor(0, 150, 136);
      doc.moveTo(0, 150).lineTo(650, 150).stroke();
      doc.text("ALLERGY", 300, 153);

      if (data.hasFoodAllergies === true || data.hasMedicationAllergies === true) {

        arrayLengthOffset = 174;

        if (data.hasFoodAllergies === true) {
          doc.text("Food Allergies:", 295, arrayLengthOffset);
          doc.text(data.foodAllergies, 430, arrayLengthOffset);
          arrayLengthOffset = (data.foodAllergies.length * 12) + arrayLengthOffset;
        }

        if (data.hasMedicationAllergies === true) {
          doc.text("Medication Allergies:", 295, arrayLengthOffset);
          doc.text(data.medicationAllergies, 430, arrayLengthOffset);
          arrayLengthOffset = (data.medicationAllergies.length * 12) + arrayLengthOffset;
        }

        arrayLengthOffset = arrayLengthOffset + 25;

      } else {
        doc.text( data.firstName + " has no known allergies", 295, 174);
        arrayLengthOffset = 174 + 35;
      }

      // bathing line
      doc.fillColor(3, 169, 244);
      doc.moveTo(0, arrayLengthOffset).lineTo(650, arrayLengthOffset).stroke();
      doc.text("BATHING", 300, arrayLengthOffset + 3);

      doc.text("Type:", 295, arrayLengthOffset + 24);
      doc.text(data.typeOfBathing + " ", 430, arrayLengthOffset + 24);

      doc.text("Time:", 295, arrayLengthOffset + 36);
      doc.text(data.timeOfBathing + " ", 430, arrayLengthOffset + 36);

      doc.text("Frequency:", 295, arrayLengthOffset + 48);
      doc.text(data.frequencyOfBathing + " ", 430, arrayLengthOffset + 48);

      arrayLengthOffset = arrayLengthOffset + 60;

      doc.text("Acceptance:", 295, arrayLengthOffset);
      doc.text(data.acceptanceOfBathing + " ", 430, arrayLengthOffset);

      if (data.acceptanceOfBathing == "Dislikes") {
        doc.text("Why Dislikes:", 295, arrayLengthOffset + 12);
        doc.text(data.dislikesBathingDescribe + " ", 430, arrayLengthOffset + 12);
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      // continent line
      doc.fillColor(121, 85, 72);
      doc.moveTo(0, arrayLengthOffset + 38).lineTo(650, arrayLengthOffset + 38).stroke();
      doc.text("CONTINENT", 300, arrayLengthOffset + 41);

      doc.text("Bowel Continent:", 295, arrayLengthOffset + 62);
      doc.text(data.bowelContinent + " ", 430, arrayLengthOffset + 62);

      doc.text("Constipated:", 295, arrayLengthOffset + 74);
      doc.text( data.constipated + " ", 430, arrayLengthOffset + 74);

      doc.text("Laxative:", 295, arrayLengthOffset + 86);
      doc.text(data.laxative + " ", 430, arrayLengthOffset + 86);

      doc.text("Bladder Continent:", 295, arrayLengthOffset + 110);
      doc.text(data.bladderContinent + " ", 430, arrayLengthOffset + 110);

      doc.text("Dribbles:", 295, arrayLengthOffset + 122);
      doc.text(data.dribbles + " ", 430, arrayLengthOffset + 122);

      if (data.catheter == true) {
        doc.text("Catheter Description:", 295, arrayLengthOffset + 134);
        doc.text(data.catheterDescribe + " ", 430, arrayLengthOffset + 134);
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      arrayLengthOffset = arrayLengthOffset + 134;

      doc.text("Toileting Device:", 295, arrayLengthOffset);
      doc.text(data.toiletingDevice + " ", 430, arrayLengthOffset);

      // mobility line
      doc.fillColor(255, 235, 59);
      doc.moveTo(0, arrayLengthOffset + 38).lineTo(650, arrayLengthOffset + 38).stroke();
      doc.text("MOBILITY", 300, arrayLengthOffset + 41);

      doc.text("Inside Apartment:", 295, arrayLengthOffset + 62);
      doc.text("Use of Assistive Device:", 295, arrayLengthOffset + 74);
      doc.text(data.insideApartment.useOfAssistiveDevice + " ", 450, arrayLengthOffset + 74);

      doc.text("Assitance with Device:", 295, arrayLengthOffset + 86);
      doc.text(data.insideApartment.assitanceWithDevice + " ", 450, arrayLengthOffset + 86);

      doc.text("Special Ambulation Needs:", 295, arrayLengthOffset + 98);
      doc.text(data.insideApartment.specialAmbulationNeeds + " ", 450, arrayLengthOffset + 98);

      doc.text("Outside Apartment:", 295, arrayLengthOffset + 122);
      doc.text("Use of Assistive Device:", 295, arrayLengthOffset + 134);
      doc.text(data.toiletingDevice + " ", 450, arrayLengthOffset + 134);

      doc.text("Assitance with Device:", 295, arrayLengthOffset + 146);
      doc.text(data.toiletingDevice + " ", 450, arrayLengthOffset + 146);

      doc.text("Special Ambulation Needs:", 295, arrayLengthOffset + 158);
      doc.text(data.toiletingDevice + " ", 450, arrayLengthOffset + 158);

      doc.text("Transfers:", 295, arrayLengthOffset + 182);
      doc.text(data.transfers + " ", 450, arrayLengthOffset + 182);

      if (data.fallRisk == true) {
        doc.text("Fall Risk Description:", 295, arrayLengthOffset + 194);
        doc.text(data.fallRiskDescribe + " ", 450, arrayLengthOffset + 194);
        arrayLengthOffset = arrayLengthOffset + 12;
      }

      doc.text("Bed Reposition:", 295, arrayLengthOffset + 194);
      doc.text(data.bedReposition + " ", 450, arrayLengthOffset + 194);

      arrayLengthOffset = arrayLengthOffset + 202

      // big vertical line
      doc.fillColor(120, 144, 156);
      //doc.lineGap(220);
      doc.moveTo(180, 0).lineTo(180, 800).stroke();

      // community title
      // doc.fontSize(16.6);
      // doc.text(75, 40, data.communityName);

      // logo
      var logoPosX = 55,
        logoPosY = 55;
      var logoWidth = 190,
        logoHeight = 75;
      //doc.addImage(imageData.getImage('transperent_logo'), 'PNG', logoPosX, logoPosY, logoPosX + logoWidth, logoPosY + logoHeight);

      // admin header
      doc.fillColor(33, 33, 33);
      doc.fontSize(16.6);
      doc.text("Care Plan", 135, 220);
      doc.text("for", 164, 235);
      doc.text(data.firstName, 75, adminOffset);

/*
      if (data.middleName !== "" || data.middleName === undefined) {
        adminOffset = adminOffset + 15;
        doc.text(75, adminOffset, data.middleName + " ");
      } */

      doc.text(data.lastName, 75, adminOffset + 15);

      // admin info
      doc.fontSize(10);

      doc.text("Sex: " + data.sex, 147, adminOffset + 30);
      if (data.sex == "Female") {
        doc.text("Maiden Name: " + data.maidenName, 99, adminOffset + 30);
        adminOffset = adminOffset + 12;
      }
      // doc.text(87, adminOffset + 42, "Date of Birth: " + residentFilteredBirthDate);
      // doc.text(81, adminOffset + 54, "Admission Date: " + residentFilteredAdmissionDate);
      if (data.buildingStatus == "Moved Out") {
        doc.text("Moved Out: " + movedOutTo, 87, 42 + adminOffset);
        doc.text("Reason: " + movedOutDescribe, 87, 42 + adminOffset);
        adminOffset = adminOffset + 24;
      } else {
        doc.text("Building Status: " + data.buildingStatus, 75, 66 + adminOffset);
      }
      doc.text("Story about " + data.firstName + " " + data.lastName, 81, adminOffset + 104);
      doc.text("could go here", 81, adminOffset + 116);

      doc.addPage();
      //doc.lineGap(25);
      var offset2 = 0;

      // nutrition line
      doc.fillColor(139, 195, 74);
      //doc.line(0, 25, 650, 25);
      doc.moveTo(0, 25).lineTo(650, 25).stroke();
      doc.text("NUTRITION", 300, 28);

      doc.text("Overall Nutrition:", 20, 49);
      doc.text(data.overallNutrition + " ", 220, 49);

      if (data.overallNutrition == "Poor") {
        doc.text("Poor Nutrition Description:", 20, 61);
        doc.text(data.poorNutritionDescribe + " ", 220, 61);
        offset2 = 12;
      }

      if (data.diabetic == true) {
        doc.text("Diabetic Type:", 20, 61 + offset2);
        doc.text(data.diabeticType + " ", 220, 61 + offset2);

        doc.text("Blood Sugar Monitoring:", 20, 73 + offset2);
        doc.text(data.bloodSugarMonitoring + " ", 220, 73 + offset2);
        offset2 = 12 + offset2;
      } else {
        doc.text(data.firstName + " is not diabetic", 20, 61 + offset2);
      }

      doc.text("Bedtime Snack:", 20, 73 + offset2);
      doc.text(data.bedtimeSnack + " ", 220, 73 + offset2);

      doc.text("Adaptive Equipment:", 20, 85 + offset2);
      doc.text(data.adaptiveEquipment + " ", 220, 85 + offset2);

      doc.text("Needs Food in Small Peices:", 20, 97 + offset2);
      doc.text(data.needsFoodInSmallPeices + " ", 220, 97 + offset2);

      doc.text("Type of Diet:", 20, 109 + offset2);
      doc.text(data.typeOfDiet + " ", 220, 109 + offset2);

      doc.text("Finger Foods:", 20, 121 + offset2);
      doc.text(data.fingerFoods + " ", 220, 121 + offset2);

      if (data.foodLikes.length !== 0) {
        doc.text("Food Likes:", 20, 133 + offset2);
        doc.text(data.foodLikes, 220, 133 + offset2);
        doc.text("likes length: " + data.foodLikes.length + " | offset2: " + offset2, 400, 133 + offset2);
        offset2 = (data.foodLikes.length * 12) + offset2;
      }

      if (data.foodDislikes.length !== 0) {
        doc.text("Food Dislikes:", 20, 133 + offset2);
        doc.text(data.foodDislikes, 220, 133 + offset2);
        doc.text( "dislikes length: " + data.foodDislikes.length + " | offset2: " + offset2, 400, 133 + offset2);
        offset2 = (data.foodDislikes.length * 12) + offset2;
      }

      // pain line
      doc.fillColor(244, 67, 54);
      doc.moveTo(0, 159 + offset2).lineTo(650, 159 + offset2).stroke();
      doc.text("PAIN", 300, 162 + offset2);

      if (data.hasPain == true) {
        doc.text("Pain Location:", 20, 186 + offset2);
        doc.text(data.painLocation + " ", 220, 186 + offset2);

        doc.text("Pain Description:", 20, 198 + offset2);
        doc.text(data.painDescription + " ", 220, 198 + offset2);

        doc.text("Max Pain Time:", 20, 210 + offset2);
        doc.text(data.maxPainTime + " ", 220, 210 + offset2);

        doc.text("Pain Increased By:", 20, 222 + offset2);
        doc.text(data.painIncreasedBy + " ", 220, 222 + offset2);

        doc.text("Pain Decreased By:", 20, 234 + offset2);
        doc.text(data.painDecreasedBy + " ", 220, 234 + offset2);

        doc.text("Pain Managed By:", 20, 246 + offset2);
        doc.text(data.painManagedBy + " ", 220, 246 + offset2);

        doc.text("Pain Length:", 20, 258 + offset2);
        doc.text(data.painLength + " ", 220, 258 + offset2);

        offset2 = offset2 + 84;

      } else {
        doc.text(data.firstName + " has not mentioned pain", 20, 186 + offset2);
      }

      // physical condition line
      doc.fillColor(33, 150, 243);
      doc.moveTo(0, 212 + offset2).lineTo(650, 212 + offset2).stroke();
      doc.text("PHYSICAL", 300, 215 + offset2);

      doc.text("Skin Condition:", 20, 236 + offset2);
      doc.text(data.skinCondition + " ", 220, 236 + offset2);

      if (data.hasWound == true) {
        doc.text("Wound Description:", 20, 248 + offset2);
        doc.text(data.hasWoundDescribe + " ", 220, 248 + offset2);

        doc.text("Wound Amount:", 20, 260 + offset2);
        doc.text(data.woundAmount + " ", 220, 260 + offset2);

        offset2 = offset2 + 24;
      }

      doc.text("Right Ear:", 20, 248 + offset2);
      doc.text(data.rightEar + " ", 220, 248 + offset2);

      doc.text("Left Ear:", 20, 260 + offset2);
      doc.text(data.leftEar + " ", 220, 260 + offset2);

      doc.text("Hearing Notes:", 20, 272 + offset2);
      doc.text(data.hearingNotes + " ", 220, 272 + offset2);

      if (data.wearsHearingAid == true) {
        if (data.helpWithHearingAid == true) {
          doc.text("Hearing Aid Help:", 20, 284 + offset2);
          doc.text(data.helpWithHearingAidDescribe + " ", 220, 284 + offset2);

          offset2 = offset2 + 12;
        }
      }

      doc.text("Right Eye:", 20, 284 + offset2);
      doc.text(data.rightEye + " ", 220, 284 + offset2);

      doc.text("Left Eye:", 20, 296 + offset2);
      doc.text(data.leftEye + " ", 220, 296 + offset2);

      doc.text("Vision Notes:", 20, 308 + offset2);
      doc.text(data.visionNotes + " ", 220, 308 + offset2);

      doc.text("Dentist Name:", 20, 320 + offset2);
      doc.text(data.dentistName + " ", 220, 320 + offset2);

      if (data.upperDentureFit == true) {
        doc.text("Upper Denture Fit:", 20, 332 + offset2);
        doc.text(data.upperDentureFitDescribe + " ", 220, 332 + offset2);

        offset2 = offset2 + 12;
      }

      doc.text("Upper Teeth:", 20, 332 + offset2);
      doc.text(data.upperTeeth + " ", 220, 332 + offset2);

      if (data.lowerDentureFit == true) {
        doc.text("Lower Denture Fit:", 20, 344 + offset2);
        doc.text(data.lowerDentureFitDescribe + " ", 220, 344 + offset2);

        offset2 = offset2 + 12;
      }

      doc.text("Lower Teeth:", 20, 344 + offset2);
      doc.text(data.lowerTeeth + " ", 220, 344 + offset2);

      doc.text("Teeth Condition:", 20, 356 + offset2);
      doc.text(data.teethCondition + " ", 220, 356 + offset2);

      doc.addPage();
      //doc.lineGap(25);
      var offset3 = 0;

      // psychosocial line
      doc.fillColor(156, 39, 176);
      doc.moveTo(0, 25).lineTo(650, 25).stroke();
      doc.text("PSYCHOSOCIAL", 300, 28);

      if (data.psychosocialStatus.length !== 0) {
        doc.text("Psychosocial Status:", 20, 49);
        doc.text(data.psychosocialStatus, 220, 49);
        offset3 = offset3 + (data.psychosocialStatus.length * 12) - 12;
      }

      doc.text("Psychosocial Status Description:", 20, 61 + offset3);
      doc.text(data.psychosocialStatusDescribe + " ", 220, 61 + offset3);

      doc.text("Comprehension:", 20, 73 + offset3);
      doc.text(data.comprehension + " ", 220, 73 + offset3);

      if (data.smokes == true) {
        doc.text("Smokes:", 20, 85 + offset3);
        doc.text(data.smokesDescribe, 220, 85 + offset3);
        offset3 = offset3 + 12;
      }

      if (data.alcohol == true) {
        doc.text("Alcohol:", 20, 85 + offset3);
        doc.text(data.alcoholDescribes, 220, 85 + offset3);
        offset3 = offset3 + 12;
      }

      if (data.sexualActive == true) {
        doc.text("Sexual Activity:", 20, 85 + offset3);
        doc.text(data.sexualActiveDescribe, 220, 85 + offset3);
        offset3 = offset3 + 12;
      }

      doc.text("Other Habits:", 20, 85 + offset3);
      doc.text(data.otherHabits + " ", 220, 85 + offset3);

      doc.text("Activity Participation:", 20, 97 + offset3);
      doc.text(data.generalActivityParticipation + " ", 220, 97 + offset3);

      doc.text("Dining Room Participation:", 20, 109 + offset3);
      doc.text(data.diningRoomParticipation + " ", 220, 109 + offset3);

      doc.text("Bus Ride Participation:", 20, 121 + offset3);
      doc.text(data.busRideParticipation + " ", 220, 121 + offset3);

      doc.text("Fitness Class Participation:", 20, 133 + offset3);
      doc.text(data.fitnessClassParticipation + " ", 220, 133 + offset3);

      doc.text("Bingo Participation:", 20, 145 + offset3);
      doc.text(data.bingoParticipation + " ", 220, 145 + offset3);

      doc.text("Community Participation:", 20, 157 + offset3);
      doc.text(data.communityParticipation + " ", 220, 157 + offset3);

      doc.text("Time in Room:", 20, 169 + offset3);
      doc.text(data.timeInRoom + " ", 220, 169 + offset3);

      if (data.drivesCar == true) {
        doc.text("License Plate Number:", 20, 181 + offset3);
        doc.text(data.licensePlateNumber + " ", 220, 181 + offset3);

        doc.text("Spare Key Location:", 20, 193 + offset3);
        doc.text(data.spareKeyLocation, 220, 193 + offset3);

        doc.text("Driving Needs:", 20, 205 + offset3);
        doc.text(data.drivingNeeds, 220, 205 + offset3);

        offset3 = offset3 + 36;
      }

      doc.text("Prefered Activites:", 20, 181 + offset3);
      doc.text(data.preferedActivites + " ", 220, 181 + offset3);

      doc.text("Uses Fitness Equipment Alone:", 20, 193 + offset3);
      doc.text(data.useFitnessEquipmentIndependently + " ", 220, 193 + offset3);

      doc.text("Family Involvement:", 20, 205 + offset3);
      doc.text(data.familyInvolvement + " ", 220, 205 + offset3);

      doc.text("High Maintenance:", 20, 217 + offset3);
      doc.text(data.highMaintenance + " ", 220, 217 + offset3);

      // sleep line
      doc.fillColor(233, 30, 99);
      //doc.line(0, 255 + offset3, 650, 255 + offset3);
      doc.moveTo(0, 255 + offset3).lineTo(650, 255 + offset3).stroke();
      doc.text("SLEEP", 300, 258 + offset3);

      doc.text("Usual Bedtime:", 20, 279 + offset3);
      doc.text(data.usualBedtime + " ", 220, 279 + offset3);

      doc.text("Usual Arising Time:", 20, 291 + offset3);
      doc.text(data.usualArisingTime + " ", 220, 291 + offset3);

      if (data.nap == true) {
        doc.text("Nap Description:", 20, 303 + offset3);
        doc.text(data.napDescribe + " ", 220, 303 + offset3);

        offset3 = offset3 + 12;
      }

      doc.text("Assistance to Bed:", 20, 303 + offset3);
      doc.text(data.assistanceToBed + " ", 220, 303 + offset3);

      if (data.sleepsThroughNight == true) {
        doc.text("Can Call for Assistance:", 20, 315 + offset3);
        doc.text(data.canCallForAssistance + " ", 220, 315 + offset3);

        offset3 = offset3 + 12;
      }
//
//       doc.addPage();
//       //doc.lineGap(25);
//       var offset4 = 0;
//
//       // vitals line
//       doc.fillColor(205, 220, 57);
//       //doc.line(0, 25, 650, 25);
//       doc.text(300, 28, "VITALS");
//
//       doc.text(50, 100, "Temperature");
//       doc.addImage(data.temperature, 'PNG', 50, 120, 150, 150);
      //
      // doc.text(210, 100, "Blood Pressure ");
      // doc.addImage(data.bloodCanvas, 'PNG', 250, 120, 150, 150);
      //
      // doc.text(410, 100, "Respiration");
      // doc.addImage(data.resp, 'PNG', 410, 120, 150, 150);
      //
      //
      // doc.text(50, 300, "Oxygen Saturation");
      // doc.addImage(data.oxygen, 'PNG', 50, 320, 150, 150);
      //
      // doc.text(210, 300, "Pulse");
      // doc.addImage(data.pulse, 'PNG', 250, 320, 150, 150);
      //
      // doc.text(410, 300, "Pain");
      // doc.addImage(data.vitals, 'PNG', 410, 320, 150, 150);

        doc.end();
};
