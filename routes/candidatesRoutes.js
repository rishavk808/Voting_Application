const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

const checkAdminRole = async(userID)=>{
    try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
    }
    catch(err){
        return false;
    }
}
//Post route to add a candidate
router.post('/',jwtAuthMiddleware,async (req,res) => {
    try{
        if(!await checkAdminRole(req.user.id))
            return res.status(404).json({message: 'user does not have admin role'});
        
       const data = req.body;//assuming the request body contains the candidate data
       
       //create a new user document using mongoose model
       const  newcandidate = new Candidate(data);
        
       //Save the new user to the database
       const response = await newcandidate.save();
       console.log('data saved');
       res.status(200).json({response:response});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.put('/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!await checkAdminRole(req.user.id))
            return res.status(404).json({message: 'user has not admin role'});

        const candidateID = req.params.candidateID;//extract the id from the url parameter
        const updatedCandidateData = req.body;//update data for the person

        const response = await Candidate.findByAndUpdate(candidateID, updatedCandidateData,{
            new:true,//return the updated document
            runValidators:true,//Run mongoose validation
        })

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

router.delete('/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!await checkAdminRole(req.user.id))
           {
            console.log("admin role not found");
            return res.status(403).json({message: 'user oes not have admin role'});
           }else{
            console.log("admin role found");
           }

        const candidateID = req.params.candidateID;//extract the id from the url parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

//voting routes
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
     //check if it admin it should not vote and voter can vote only once
     candidateID = req.params.candidateID;
     userID = req.user.id;

     try{
        //candidate document needs to be found
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'candidate not found'});
        }

        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message: 'user not found'});
        }
        if(user.isVoted){
            res.status(404).json({message: 'You have already voted'});
        }
        if(user.role === 'admin'){
            res.status(403).json({message: 'you are an admin , you cannot vote'});
        }

        candidate.votes.push({user: userID})
        candidate.voteCount++;
        await candidate.save();

        //update the user document  to is voted = true;
        user.isVoted = true
        await user.save();

        res.status(200).json({message: 'Voting successful'});
     }catch(err){
       
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
     }
});

router.get('/vote/count',async(req,res)=>{
    try{
      //find all the candidates and sort them by their vote count
       const candidate = await Candidate.find().sort({voteCount: 'desc'});
    
       //map the candidate to only return their name and votecount
       const voterecord = candidate.map((data)=>{
           return{
            party:data.party,
            count: data.voteCount
           }
       });

       return res.status(200).json(voterecord);
    }
    catch(err){
       console.log(err);
       res.status(500).json({error:'Internal server error'});
    }
})
module.exports = router;